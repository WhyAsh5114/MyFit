import { apiClient } from '$lib/clients/api-client';
import { getDb, type DbClient } from '$lib/clients/idb-client';
import { queryClient } from '$lib/clients/query-client';
import { loadPullCursor, savePullCursor } from './sync-cursor';
import { STORAGE_HASH_HEADER } from '@myfit/schema/client';
import {
	ContractMismatchError,
	type LogWithRecord,
	type PushResult,
	type SyncRequestContext,
	type SyncWorker,
	type SyncWorkerStatus
} from '@prisma-idb/sync-extension-idb/client';

const SYNC_WORKER_STATE_KEY = '__myfit_sync_worker_state__';

const storageHashHeader = ({ storageHash }: SyncRequestContext) => ({
	[STORAGE_HASH_HEADER]: storageHash
});

/**
 * Owns the app's single sync worker and the reactive state the sync indicator reads.
 *
 * The worker is bound to one database client. Call `start()` once the user is signed in and
 * `stop()` before the database is reset, so the next `start()` binds a new worker to the fresh client.
 */
class SyncWorkerState {
	syncWorker = $state<SyncWorker>();
	syncStatus = $state<SyncWorkerStatus>();
	lastSyncTime = $state<Date | null>(null);
	lastError = $state<string | null>(null);

	/** Bumped by every `start()` and `stop()`, so a start that was overtaken while awaiting the database can bail out. */
	private generation = 0;
	private unsubscribe: Array<() => void> = [];

	/** Binds a new worker to the current database and starts it. Does nothing if one is already running. */
	start() {
		if (this.syncWorker) return;
		const generation = ++this.generation;
		void this.bindWorker(generation).catch((error) => {
			console.error('Failed to start sync worker:', error);
			this.lastError = error instanceof Error ? error.message : String(error);
		});
	}

	/** Stops the worker and forgets it, along with its status and error. */
	stop() {
		this.generation++;
		this.unsubscribe.forEach((off) => off());
		this.unsubscribe = [];
		this.syncWorker?.stop();
		this.syncWorker = undefined;
		this.syncStatus = undefined;
		this.lastError = null;
	}

	private async bindWorker(generation: number) {
		const db = await getDb();
		if (generation !== this.generation) return;

		const worker = this.createWorker(db);
		this.unsubscribe = this.listenTo(worker);
		this.syncWorker = worker;
		this.syncStatus = worker.status;
		worker.start();
	}

	/** Creates a worker that pushes and pulls through the API, resuming from the saved pull cursor. */
	private createWorker(db: DbClient): SyncWorker {
		return db.createSyncWorker({
			pushHandler: async (events, signal, context) => {
				const res = await apiClient.api.sync.push.$post(
					{ json: { events } },
					{ headers: storageHashHeader(context), init: { signal } }
				);
				if (!res.ok) throw this.fail(`Push failed: ${res.statusText}`, res.status);
				return (await res.json()) as PushResult[];
			},
			pullHandler: async (since, signal, context) => {
				const res = await apiClient.api.sync.pull.$get(
					{ query: since ? { since } : {} },
					{ headers: storageHashHeader(context), init: { signal } }
				);
				if (!res.ok) throw this.fail(`Pull failed: ${res.statusText}`, res.status);
				return (await res.json()) as LogWithRecord[];
			},
			getCursor: loadPullCursor,
			setCursor: savePullCursor,
			batchSize: 50,
			intervalMs: 10000
		});
	}

	/** Mirrors the worker's status and outcomes into reactive state. Returns the unsubscribe functions. */
	private listenTo(worker: SyncWorker): Array<() => void> {
		return [
			worker.on('statuschange', (status) => {
				this.syncStatus = status;
			}),
			worker.on('contractmismatch', () => {
				this.lastError = 'This version of the app is out of date. Reload to keep syncing.';
			}),
			// The worker also emits this after a rejected push, so only a push that left
			// nothing waiting counts as a sync. It never clears `lastError`: a pull does, once
			// the outbox is clear and the server is reachable again.
			worker.on('pushcompleted', ({ failed, pullBlocked }) => {
				if (failed === 0 && !pullBlocked) this.lastSyncTime = new Date();
			}),
			worker.on('pullcompleted', async ({ applied }) => {
				this.lastSyncTime = new Date();
				this.lastError = null;
				if (applied > 0) {
					await queryClient.invalidateQueries({ refetchType: 'active' });
				}
			})
		];
	}

	/** The worker only exposes a status string, so remember handler failures to show them. */
	private fail(message: string, httpStatus: number): Error {
		// The server answers 409 when the bundle's contract differs from its own.
		if (httpStatus === 409) return new ContractMismatchError();
		this.lastError = message;
		return new Error(message);
	}
}

const g = globalThis as Record<string, unknown>;
if (!g[SYNC_WORKER_STATE_KEY]) {
	g[SYNC_WORKER_STATE_KEY] = new SyncWorkerState();
}
export const syncWorkerState = g[SYNC_WORKER_STATE_KEY] as SyncWorkerState;
