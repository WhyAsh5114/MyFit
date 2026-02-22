import { apiClient } from '$lib/clients/api-client';
import { getClient } from '$lib/clients/idb-client';
import { queryClient } from '$lib/clients/query-client';
import { type SyncWorkerStatus, type SyncWorker } from '@myfit/api/prisma-idb/client';

const SYNC_WORKER_STATE_KEY = '__myfit_sync_worker_state__';

class SyncWorkerState {
	syncWorker = $state<SyncWorker>();
	syncStatus = $state<SyncWorkerStatus>();

	constructor() {
		this.syncWorker = getClient().createSyncWorker({
			push: {
				handler: async (events) => {
					const res = await apiClient.api.sync.push.$post({ json: { events } });
					if (!res.ok) throw new Error(`Push failed: ${res.statusText}`);
					return await res.json();
				},
				batchSize: 50
			},
			pull: {
				handler: async (lastChangelogId) => {
					const res = await apiClient.api.sync.pull.$get({ query: { lastChangelogId } });
					if (!res.ok) throw new Error(`Pull failed: ${res.statusText}`);
					return await res.json();
				},
				getCursor: () => this.getCursor(),
				setCursor: (cursor) => this.setCursor(cursor)
			},
			schedule: {
				intervalMs: 10000
			}
		});

		this.syncWorker.on('statuschange', () => {
			this.syncStatus = this.syncWorker!.status;
		});

		this.syncWorker.on('pullcompleted', async (e) => {
			if (e.detail.totalAppliedRecords > 0) {
				await queryClient.invalidateQueries({ refetchType: 'active' });
			}
		});

		this.syncWorker.start();
	}

	getCursor(): string | undefined {
		return localStorage.getItem('lastSyncedAt') ?? undefined;
	}

	setCursor(cursor: string | undefined): void {
		if (cursor !== undefined) {
			localStorage.setItem('lastSyncedAt', cursor);
		} else {
			localStorage.removeItem('lastSyncedAt');
		}
	}
}

const g = globalThis as Record<string, unknown>;
if (!g[SYNC_WORKER_STATE_KEY]) {
	g[SYNC_WORKER_STATE_KEY] = new SyncWorkerState();
}
export const syncWorkerState = g[SYNC_WORKER_STATE_KEY] as SyncWorkerState;
