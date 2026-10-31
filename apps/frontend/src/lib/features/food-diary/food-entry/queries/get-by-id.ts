import { getDb } from '#lib/clients/idb-client.js';
import { dependOn, type Depends } from '#lib/features/dependencies.js';
import { foodEntryKeys } from '../keys';

/** One of a user's food entries, or `null` when it no longer exists. */
export async function getFoodEntryById(
	depends: Depends,
	{ userId, id }: { userId: string; id: string }
) {
	dependOn(depends, foodEntryKeys.byId(userId, id));
	const { orm } = await getDb();
	return await orm.foodEntry.where({ id, userId }).first();
}
