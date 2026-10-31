import { getDb } from '#lib/clients/idb-client.js';
import { defineReader } from '#lib/features/dependencies.js';
import { userKeys } from '../keys';

/** A user's local record, or `null` when the local database doesn't hold it. */
export const getLocalUser = defineReader({
	keys: (userId: string) => [userKeys.detail(userId)],
	read: async (userId) => {
		const { orm } = await getDb();
		return await orm.user.where({ id: userId }).first();
	}
});
