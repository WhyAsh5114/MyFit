import { PUBLIC_API_URL } from '$app/env/public';
import type { DbClient } from '#lib/clients/idb-client.js';
import { queryClient } from '#lib/clients/query-client.js';
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
 * The session cacher binds it to the open database once the account is ready and stops it before
 * the database or the account changes.
 */
class SyncWorkerState {
	syncWorker = $state<SyncWorker>();
	syncStatus = $state<SyncWorkerStatus>();
	lastSyncTime = $state<Date | null>(null);
	lastError = $state<string | null>(null);

	private unsubscribe: Array<() => void> = [];

	/** Binds a new worker to `db` and starts it. Does nothing if one is already running. */
	start(db: DbClient) {
		if (this.syncWorker) return;
		const worker = this.createWorker(db);
		this.unsubscribe = this.listenTo(worker);
		this.syncWorker = worker;
		this.syncStatus = worker.status;
		worker.start();
	}

	/** Stops the worker and forgets it, along with its status and error. Settles once its active cycle has. */
	async stop() {
		this.unsubscribe.forEach((off) => off());
		this.unsubscribe = [];
		const worker = this.syncWorker;
		this.syncWorker = undefined;
		this.syncStatus = undefined;
		this.lastError = null;
		this.lastSyncTime = null;
		await worker?.stop();
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
