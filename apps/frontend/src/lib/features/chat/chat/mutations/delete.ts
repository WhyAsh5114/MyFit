import { getDb } from '#lib/clients/idb-client.js';
import { invalidateKeys } from '#lib/data/dependencies.js';
import { useMutation } from '#lib/data/mutation.svelte.js';
import { m } from '#lib/paraglide/messages.js';
import { toast } from 'svelte-sonner';
import { chatKeys } from '../keys';

/**
 * Deletes a chat and its messages, and resolves to what it deleted so the caller can offer an undo,
 * or to `null` when another write removed the chat first. Its photos stay in object storage, so an
 * undo brings them back too.
 */
export const useDeleteChat = () =>
	useMutation({
		mutationFn: async ({ userId, id }: { userId: string; id: string }) => {
			const db = await getDb();
			return await db.transaction(['chat', 'chatMessage'], async (tx) => {
				const chat = await tx.chat.where({ id, userId }).first();
				if (!chat) return null;
				const messages = await tx.chatMessage.where({ chatId: id }).all();
				await tx.chatMessage.where({ chatId: id }).deleteAll();
				await tx.chat.where({ id, userId }).deleteAll();
				return { chat, messages };
			});
		},
		// The history list, not the chat's own page: that one would show an empty chat while the
		// caller navigates away.
		onSuccess: (_deleted, { userId }) => invalidateKeys(chatKeys.byUser(userId)),
		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to delete chat:', error);
		}
	});
