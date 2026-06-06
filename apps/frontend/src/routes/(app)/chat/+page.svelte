<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport } from 'ai';
	import { PUBLIC_API_URL } from '$env/static/public';
	import ChatMessages from './chat-messages.svelte';
	import ChatInput from './chat-input.svelte';

	const chat = new Chat({
		transport: new DefaultChatTransport({
			api: `${PUBLIC_API_URL}/api/chat`
		})
	});
</script>

<ChatMessages messages={chat.messages} />
<ChatInput
	status={chat.status}
	onsendmessage={(parts) => chat.sendMessage({ role: 'user', parts })}
/>
