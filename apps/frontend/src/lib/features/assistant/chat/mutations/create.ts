import { getDb } from '#lib/clients/idb-client.js';
import { invalidateKeys } from '#lib/data/dependencies.js';
import { useMutation } from '#lib/data/mutation.svelte.js';
import { m } from '#lib/paraglide/messages.js';
import { toast } from 'svelte-sonner';
import { chatKeys } from '../keys';
import type { useDeleteChat } from './delete';

type Deleted = NonNullable<Awaited<ReturnType<ReturnType<typeof useDeleteChat>['mutateAsync']>>>;

/** Puts back a chat that was just deleted, with its messages, under the same ids (the undo). */
export const useCreateChat = () =>
	useMutation({
		mutationFn: async ({ chat, messages }: Deleted) => {
			const db = await getDb();
			await db.transaction(['chat', 'chatMessage'], async (tx) => {
				await tx.chat.create(chat);
				for (const message of messages) await tx.chatMessage.create(message);
			});
			return chat;
		},
		onSuccess: (chat) => invalidateKeys(chatKeys.byUser(chat.userId)),
		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to restore chat:', error);
		}
	});
