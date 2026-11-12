import { getDb } from '#lib/clients/idb-client.js';
import { defineReader } from '#lib/data/dependencies.js';
import { chatKeys } from '../keys';

/** A user's saved chats, the most recently active first. */
export const getChats = defineReader({
	keys: (userId: string) => [chatKeys.byUser(userId)],
	read: async (userId) => {
		const { orm } = await getDb();
		return await orm.chat.where({ userId }).orderBy({ updatedAt: 'desc' }).all();
	}
});
