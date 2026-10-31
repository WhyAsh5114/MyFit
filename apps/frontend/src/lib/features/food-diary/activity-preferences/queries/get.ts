import { getDb } from '#lib/clients/idb-client.js';
import { defineReader } from '#lib/data/dependencies.js';
import { activityPreferencesKeys } from '../keys';

/** A user's latest activity preferences, or `null` when they have none. */
export const getActivityPreferences = defineReader({
	keys: (userId: string) => [activityPreferencesKeys.byUser(userId)],
	read: async (userId) => {
		const { orm } = await getDb();
		return await orm.activityPreferences
			.where({ userId })
			.orderBy({ effectiveFrom: 'desc' })
			.first();
	}
});
