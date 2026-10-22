import { PUBLIC_API_URL } from '$env/static/public';
import { getDb, type DbClient } from '$lib/clients/idb-client';
import { queryClient } from '$lib/clients/query-client';
import { loadPullCursor, savePullCursor } from './sync-cursor';
import {
	createSyncFetchHandlers,
	type SyncWorker,
	type SyncWorkerStatus
} from '@prisma-idb/sync-extension-idb/client';

const SYNC_WORKER_STATE_KEY = '__myfit_sync_worker_state__';

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

	/**
	 * Waits for the database to open, then binds and starts a worker on it. Returns without
	 * doing anything if `stop()` or another `start()` ran in the meantime, so a superseded
	 * startup never leaves a worker on a database that was reset.
	 */
	private async bindWorker(generation: number) {
		const db = await getDb();
		if (generation !== this.generation) return;

		const worker = this.createWorker(db, generation);
		this.unsubscribe = this.listenTo(worker);
		this.syncWorker = worker;
		this.syncStatus = worker.status;
		worker.start();
	}

	/**
	 * Creates a worker that pushes and pulls through the API, resuming from the saved pull cursor.
	 *
	 * `stop()` does not cancel a cycle that is already running, so the callbacks of an
	 * older `generation` do nothing. Otherwise that cycle could write its cursor after the
	 * database reset cleared it, and the next account would skip history.
	 */
	private createWorker(db: DbClient, generation: number): SyncWorker {
		const isCurrent = () => generation === this.generation;
		return db.createSyncWorker({
			...createSyncFetchHandlers({
				pushUrl: `${PUBLIC_API_URL}/api/sync/push`,
				pullUrl: `${PUBLIC_API_URL}/api/sync/pull`,
				credentials: 'include',
				fetch: async (input, init) => {
					const response = await fetch(input, init);
					// A 409 is reported through the worker's `contractmismatch` event instead.
					if (!response.ok && response.status !== 409 && isCurrent()) {
						this.lastError = `Sync failed: ${response.statusText || response.status}`;
					}
					return response;
				}
			}),
			getCursor: loadPullCursor,
			setCursor: (changelogId) => {
				if (isCurrent()) savePullCursor(changelogId);
			},
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
}

const g = globalThis as Record<string, unknown>;
if (!g[SYNC_WORKER_STATE_KEY]) {
	g[SYNC_WORKER_STATE_KEY] = new SyncWorkerState();
}
export const syncWorkerState = g[SYNC_WORKER_STATE_KEY] as SyncWorkerState;
