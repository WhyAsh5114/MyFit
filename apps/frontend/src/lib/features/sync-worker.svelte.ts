import { PUBLIC_API_URL } from '$env/static/public';
import { getDb, type DbClient } from '$lib/clients/idb-client';
import { queryClient } from '$lib/clients/query-client';
import { invalidatePulledChanges } from './sync-invalidation';
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

	/** True from `start()` until the worker is bound or `stop()` runs, so a start that `stop()` overtook while awaiting the database does nothing. */
	private starting = false;
	private unsubscribe: Array<() => void> = [];

	/** Binds a new worker to the current database and starts it. Does nothing if one is already running. */
	start() {
		if (this.syncWorker || this.starting) return;
		this.starting = true;
		void this.bindWorker().catch((error) => {
			this.starting = false;
			console.error('Failed to start sync worker:', error);
			this.lastError = error instanceof Error ? error.message : String(error);
		});
	}

	/**
	 * Stops the worker and forgets it, along with its status and error. The returned promise
	 * settles once the worker's active cycle has, so await it before resetting the database.
	 */
	async stop() {
		this.starting = false;
		this.unsubscribe.forEach((off) => off());
		this.unsubscribe = [];
		const worker = this.syncWorker;
		this.syncWorker = undefined;
		this.syncStatus = undefined;
		this.lastError = null;
		await worker?.stop();
	}

	/**
	 * Waits for the database to open, then binds and starts a worker on it. Returns without
	 * doing anything if `stop()` ran in the meantime, so a stopped startup never leaves a
	 * worker on a database that was reset.
	 */
	private async bindWorker() {
		const db = await getDb();
		if (!this.starting) return;
		this.starting = false;

		const worker = this.createWorker(db);
		this.unsubscribe = this.listenTo(worker);
		this.syncWorker = worker;
		this.syncStatus = worker.status;
		worker.start();
	}

	/** Creates a worker that pushes and pulls through the API and syncs again when the browser comes back online. */
	private createWorker(db: DbClient): SyncWorker {
		return db.createSyncWorker({
			...createSyncFetchHandlers({
				pushUrl: `${PUBLIC_API_URL}/api/sync/push`,
				pullUrl: `${PUBLIC_API_URL}/api/sync/pull`,
				credentials: 'include'
			}),
			batchSize: 50,
			intervalMs: 10000,
			syncOnReconnect: true
		});
	}

	/** Mirrors the worker's status and outcomes into reactive state. Returns the unsubscribe functions. */
	private listenTo(worker: SyncWorker): Array<() => void> {
		return [
			worker.on('statuschange', (status) => {
				this.syncStatus = status;
			}),
			worker.on('error', (error) => {
				this.lastError = error.message;
			}),
			worker.on('contractmismatch', () => {
				this.lastError = 'This version of the app is out of date. Reload to keep syncing.';
			}),
			// The worker also emits this after a rejected push, so only a push that left
			// nothing waiting counts as a sync. It never clears `lastError`: a pull does, once
			// the outbox is clear and the server is reachable again. A stalled event blocks
			// every later pull, so surface it instead of retrying silently.
			worker.on('pushcompleted', ({ failed, pullBlocked, stalled }) => {
				if (failed === 0 && !pullBlocked) this.lastSyncTime = new Date();
				if (stalled) this.lastError = stalled.lastError ?? 'Some changes keep failing to sync.';
			}),
			worker.on('pullcompleted', async ({ changes }) => {
				this.lastSyncTime = new Date();
				this.lastError = null;
				await invalidatePulledChanges(queryClient, changes);
			})
		];
	}
}

const g = globalThis as Record<string, unknown>;
if (!g[SYNC_WORKER_STATE_KEY]) {
	g[SYNC_WORKER_STATE_KEY] = new SyncWorkerState();
}
export const syncWorkerState = g[SYNC_WORKER_STATE_KEY] as SyncWorkerState;
