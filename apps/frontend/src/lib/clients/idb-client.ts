import { createManagedAutoSyncIdbClient } from '@prisma-idb/sync-extension-idb/client';
import type { SyncIdbClient } from '@prisma-idb/sync-extension-idb/client';
import { idbSyncExtension } from '@prisma-idb/sync-extension-idb/control';
import { contractSpace, type Contract } from '@myfit/schema/client';

export type DbClient = SyncIdbClient<Contract>;

const managedDb = createManagedAutoSyncIdbClient<Contract>({
	contractSpace,
	// The sync stores were squashed into one baseline, which an older `myfit` database cannot upgrade to.
	dbName: 'myfit-v2',
	extensions: [idbSyncExtension]
});

/** The schema enums. Available at once, even while prerendering, because reading them never opens IndexedDB. */
export const enums = managedDb.enums;

/** Migrates on first call, then returns the shared sync-tracked client: `db.orm.*` writes also land in the outbox. */
export const getDb = (): Promise<DbClient> => managedDb.get();

/** Closes and deletes the local database. Used on logout so the next account never sees this one's data. */
export const resetDb = (): Promise<void> => managedDb.reset();
