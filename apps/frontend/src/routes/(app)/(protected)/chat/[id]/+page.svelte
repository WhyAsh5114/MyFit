<script lang="ts">
	import ChatHeader from '../components/chat-header.svelte';
	import ChatInput from '../components/chat-input.svelte';
	import ChatMessages from '../components/chat-messages.svelte';
	import { openChat, setChatPageContext } from '../components/chat.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const meals = $derived(data.meals.map(({ id, name }) => ({ id, name })));
	// A save reruns this page's load, but the open conversation is kept: only another id opens another.
	const session = $derived(
		openChat(data.chatId, data.ownerId, data.chat?.messages ?? [], () => meals.map((m) => m.name))
	);

	setChatPageContext({
		get session() {
			return session;
		},
		get meals() {
			return meals;
		}
	});
</script>

<ChatHeader chats={data.chats} title={data.chat?.title ?? null} />
<ChatMessages />
<ChatInput />
