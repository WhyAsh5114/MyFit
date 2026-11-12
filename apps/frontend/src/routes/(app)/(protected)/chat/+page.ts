import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { lastChatId } from './components/chat.svelte';
import type { PageLoad } from './$types';

/** The Chat tab returns to the open conversation, or starts a new one. */
export const load: PageLoad = () => {
	redirect(
		307,
		resolve('/(app)/(protected)/chat/[id]', { id: lastChatId() ?? crypto.randomUUID() })
	);
};
