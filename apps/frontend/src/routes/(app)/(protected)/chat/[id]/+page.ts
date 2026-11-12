import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import z from 'zod';
import { getChats } from '#lib/features/chat/chat/queries/get.js';
import { getChatById } from '#lib/features/chat/chat/queries/get-by-id.js';
import { getMeals } from '#lib/features/food-diary/meals/queries/get.js';
import type { PageLoad } from './$types';

/** A chat page: the conversation (`null` until its first message is saved), the history and the meals. */
export const load: PageLoad = async ({ params, depends, parent }) => {
	const { ownerId } = await parent();
	if (!z.uuid().safeParse(params.id).success) redirect(307, resolve('chat'));

	const [chat, chats, meals] = await Promise.all([
		getChatById(depends, { userId: ownerId, id: params.id }),
		getChats(depends, ownerId),
		getMeals(depends, ownerId)
	]);
	return { chatId: params.id, chat, chats, meals };
};
