import { getDb } from '#lib/clients/idb-client.js';
import { defineReader } from '#lib/data/dependencies.js';
import { macroMetricsKeys } from '../keys';

/** A user's latest body metrics, or `null` when they have none. */
export const getMacroMetrics = defineReader({
	keys: (userId: string) => [macroMetricsKeys.byUser(userId)],
	read: async (userId) => {
		const { orm } = await getDb();
		return await orm.macroMetrics.where({ userId }).orderBy({ effectiveFrom: 'desc' }).first();
	}
});
