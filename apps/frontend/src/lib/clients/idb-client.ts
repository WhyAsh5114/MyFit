import { createManagedAutoSyncIdbClient } from '@prisma-idb/sync-extension-idb/client';
import type { SyncIdbClient } from '@prisma-idb/sync-extension-idb/client';
import { idbSyncExtension } from '@prisma-idb/sync-extension-idb/control';
import { contractSpace, type Contract } from '@myfit/schema/client';

export type DbClient = SyncIdbClient<Contract>;

// Created on first use rather than at import: the factory reads `indexedDB`, which
// doesn't exist while SvelteKit prerenders.
let managedDb: ReturnType<typeof createManagedAutoSyncIdbClient<Contract>> | undefined;

const getManagedDb = () =>
	(managedDb ??= createManagedAutoSyncIdbClient<Contract>({
		contractSpace,
		dbName: 'myfit',
		extensions: [idbSyncExtension]
	}));

/** Migrates on first call, then returns the shared sync-tracked client: `db.orm.*` writes also land in the outbox. */
export const getDb = (): Promise<DbClient> => getManagedDb().get();

/** Closes and deletes the local database. Used on logout so the next account never sees this one's data. */
export const resetDb = (): Promise<void> => getManagedDb().reset();
