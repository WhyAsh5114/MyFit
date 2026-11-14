import { getDb } from '#lib/clients/idb-client.js';
import { defineReader } from '#lib/data/dependencies.js';
import { mealTimes, rankFoodHistory } from '#lib/domain/food-history/rank.js';
import { foodEntryKeys } from '../keys';

/** How far back the foods the user logged are read. Older ones would barely rank anyway. */
const HISTORY_DAYS = 180;

/**
 * The foods the user logged in the last 180 days, each with its latest entry, most likely first,
 * and when they logged each meal, to pick the meal for a food logged again.
 */
export const getFoodHistory = defineReader({
	keys: (userId: string) => [foodEntryKeys.byUser(userId)],
	read: async (userId) => {
		const now = new Date();
		const since = new Date(now);
		since.setDate(since.getDate() - HISTORY_DAYS);
		const { orm } = await getDb();
		const entries = await orm.foodEntry
			.where({ userId })
			.where((f) => f.eatenAt.gte(since))
			.all();
		return { foods: rankFoodHistory(entries, now), mealTimes: mealTimes(entries) };
	}
});
