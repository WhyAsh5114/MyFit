import { getDb } from '#lib/clients/idb-client.js';
import { defineReader } from '#lib/data/dependencies.js';
import { mealKeys } from '../keys';

/** A user's active meals, in the order they chose. */
export const getMeals = defineReader({
	keys: (userId: string) => [mealKeys.byUser(userId)],
	read: async (userId) => {
		const { orm } = await getDb();
		return await orm.meal.where({ userId, active: true }).orderBy({ sortOrder: 'asc' }).all();
	}
});
