import type { MyUIMessage } from '@myfit/api';
import { getDb } from '#lib/clients/idb-client.js';
import { defineReader } from '#lib/data/dependencies.js';
import { chatKeys } from '../keys';

/**
 * One chat with its messages in order, or `null` for a chat that has not been saved yet: a new
 * chat gets its id before its first message.
 */
export const getChatById = defineReader({
	keys: ({ userId, id }: { userId: string; id: string }) => [chatKeys.byId(userId, id)],
	read: async ({ userId, id }) => {
		const { orm } = await getDb();
		const chat = await orm.chat.where({ id, userId }).first();
		if (!chat) return null;
		const rows = await orm.chatMessage.where({ chatId: id }).orderBy({ position: 'asc' }).all();
		const messages = rows.map(
			(row) => ({ id: row.id, role: row.role, parts: row.parts }) as unknown as MyUIMessage
		);
		return { ...chat, messages };
	}
});
