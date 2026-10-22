import { apiClient } from '$lib/clients/api-client';
import { getDb } from '$lib/clients/idb-client';
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

class SyncWorkerState {
	syncWorker = $state<SyncWorker>();
	syncStatus = $state<SyncWorkerStatus>();
	lastSyncTime = $state<Date | null>(null);
	lastError = $state<string | null>(null);

	constructor() {
		void this.init().catch((error) => {
			console.error('Failed to start sync worker:', error);
			this.lastError = error instanceof Error ? error.message : String(error);
		});
	}

	private async init() {
		const db = await getDb();

		const worker = db.createSyncWorker({
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

		worker.on('statuschange', (status) => {
			this.syncStatus = status;
		});

		worker.on('contractmismatch', () => {
			this.lastError = 'This version of the app is out of date. Reload to keep syncing.';
		});

		worker.on('pushcompleted', () => {
			this.lastSyncTime = new Date();
			this.lastError = null;
		});

		worker.on('pullcompleted', async ({ applied }) => {
			this.lastSyncTime = new Date();
			this.lastError = null;
			if (applied > 0) {
				await queryClient.invalidateQueries({ refetchType: 'active' });
			}
		});

		this.syncWorker = worker;
		this.syncStatus = worker.status;
		worker.start();
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
