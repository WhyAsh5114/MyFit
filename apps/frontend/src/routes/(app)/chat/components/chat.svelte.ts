import { Chat } from '@ai-sdk/svelte';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { PUBLIC_API_URL } from '$env/static/public';
import type { MyUIMessage } from '@myfit/api';

export const chat = $state(
	new Chat<MyUIMessage>({
		transport: new DefaultChatTransport({
			api: `${PUBLIC_API_URL}/api/chat`
		}),
		sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls
	})
);

export function resetChat() {
	if (chat.status !== 'ready') {
		chat.stop();
	}
	chat.messages = [];
}
