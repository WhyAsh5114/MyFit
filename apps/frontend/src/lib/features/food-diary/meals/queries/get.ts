import { getDb } from '#lib/clients/idb-client.js';
import { dependOn, type Depends } from '#lib/features/dependencies.js';
import { mealKeys } from '../keys';

/** A user's active meals, in the order they chose. */
export async function getMeals(depends: Depends, userId: string) {
	dependOn(depends, mealKeys.byUser(userId));
	const { orm } = await getDb();
	return await orm.meal.where({ userId, active: true }).orderBy({ sortOrder: 'asc' }).all();
}
