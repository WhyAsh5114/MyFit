import { getDb } from '#lib/clients/idb-client.js';
import { defineReader } from '#lib/data/dependencies.js';
import { foodEntryKeys } from '../keys';

type Args = { userId: string; ids: string[] };

/** The user's entries with these ids, each with its meal. An id with no entry is left out. */
export const getFoodEntriesByIds = defineReader({
	keys: ({ userId }: Args) => [foodEntryKeys.byUser(userId)],
	read: async ({ userId, ids }) => {
		const { orm } = await getDb();
		return await orm.foodEntry
			.where({ userId })
			.where((entry) => entry.id.in(ids))
			.include('meal')
			.all();
	}
});
