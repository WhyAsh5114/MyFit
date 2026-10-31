import { getDb } from '#lib/clients/idb-client.js';
import { defineReader } from '#lib/features/dependencies.js';
import { foodEntryKeys } from '../keys';

/** One of a user's food entries, or `null` when it no longer exists. */
export const getFoodEntryById = defineReader({
	keys: ({ userId, id }: { userId: string; id: string }) => [foodEntryKeys.byId(userId, id)],
	read: async ({ userId, id }) => {
		const { orm } = await getDb();
		return await orm.foodEntry.where({ id, userId }).first();
	}
});
