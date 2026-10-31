import { getDb } from '#lib/clients/idb-client.js';
import { dependOn, type Depends } from '#lib/features/dependencies.js';
import { activityPreferencesKeys } from '../keys';

/** A user's latest activity preferences, or `null` when they have none. */
export async function getActivityPreferences(depends: Depends, userId: string) {
	dependOn(depends, activityPreferencesKeys.byUser(userId));
	const { orm } = await getDb();
	return await orm.activityPreferences.where({ userId }).orderBy({ effectiveFrom: 'desc' }).first();
}
