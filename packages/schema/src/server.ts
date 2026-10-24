import { createSyncServer } from '@prisma-idb/sync-server';
import { createSqlSyncAdapter, sqlGetKeyField } from '@prisma-idb/sync-server-sql';
import type { Contract as ClientContract } from './contract';
import type { Contract as ServerContract } from './schema.postgres.generated';
import clientContractJson from './contract.json' with { type: 'json' };
import serverContractJson from './schema.postgres.generated.json' with { type: 'json' };

export type { ServerContract };
export type { Models as ServerModels } from './schema.postgres.generated';

// The contract JSON's branded id types don't survive the JSON import, hence the casts.
export const serverContract = serverContractJson as unknown as ServerContract;

export const syncServer = createSyncServer({
	contract: serverContract,
	clientContract: clientContractJson as unknown as ClientContract,
	rootModel: 'User',
	// Every synced model here has a single-field key, so sqlGetKeyField's
	// "no compound keys" limitation never triggers.
	getKeyField: sqlGetKeyField
});

export const sqlSyncAdapter = createSqlSyncAdapter({ contract: serverContract, syncServer });
