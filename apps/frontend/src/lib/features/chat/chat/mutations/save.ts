import type { MyUIMessage } from '@myfit/api';
import { getDb } from '#lib/clients/idb-client.js';
import { invalidateKeys } from '#lib/data/dependencies.js';
import { useMutation } from '#lib/data/mutation.svelte.js';
import { m } from '#lib/paraglide/messages.js';
import { toast } from 'svelte-sonner';
import { chatKeys } from '../keys';
import { chatTitle, storedParts } from '../model';

type Variables = {
	userId: string;
	chatId: string;
	messages: MyUIMessage[];
	/** The stored JSON of each message already saved, by id. Only messages that differ are written. */
	saved: Map<string, string>;
	/** A title made for the chat, which replaces the one taken from its first message. */
	title?: string;
};

/**
 * Saves a conversation: upserts the chat, then writes only the messages that
 * changed since the last save, so each turn adds a message or two to the outbox instead of the
 * whole conversation. Updates `saved` once the write commits.
 */
export const useSaveChat = () =>
	useMutation({
		mutationFn: async ({ userId, chatId, messages, saved, title }: Variables) => {
			const changed = messages
				.map((message, position) => ({
					message,
					position,
					json: JSON.stringify(storedParts(message))
				}))
				.filter(({ message, json }) => saved.get(message.id) !== json);
			if (changed.length === 0 && !title) return { userId, changed: false };

			const db = await getDb();
			await db.transaction(['chat', 'chatMessage'], async (tx) => {
				const now = new Date();
				await tx.chat.upsert({
					where: { id: chatId },
					// A title made for the chat replaces the one taken from its first message.
					update: { updatedAt: now, ...(title && { title }) },
					create: {
						id: chatId,
						userId,
						title: title ?? chatTitle(messages) ?? m['chat.untitled'](),
						createdAt: now,
						updatedAt: now
					}
				});

				for (const { message, position, json } of changed) {
					const data = { position, role: message.role, parts: JSON.parse(json) };
					await tx.chatMessage.upsert({
						where: { id: message.id },
						update: data,
						create: { id: message.id, chatId, ...data }
					});
				}
			});
			for (const { message, json } of changed) saved.set(message.id, json);
			return { userId, changed: true };
		},

		// Reloads the history list. The open chat isn't rebuilt from its reloaded data.
		onSuccess: ({ userId, changed }) => changed && invalidateKeys(chatKeys.byUser(userId)),

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to save chat:', error);
		}
	});
