import { getDb } from '#lib/clients/idb-client.js';
import { defineReader } from '#lib/features/data/dependencies.js';
import { macroTargetsKeys } from '../keys';

/** A user's latest macro targets, or `null` when they have none. */
export const getMacroTargets = defineReader({
	keys: (userId: string) => [macroTargetsKeys.byUser(userId)],
	read: async (userId) => {
		const { orm } = await getDb();
		return await orm.macroTargets.where({ userId }).orderBy({ effectiveFrom: 'desc' }).first();
	}
});
