import { Chat } from '@ai-sdk/svelte';
import { getLocalTimeZone, today } from '@internationalized/date';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';

import { PUBLIC_API_URL } from '$app/env/public';
import { page } from '$app/state';
import type { MyUIMessage } from '@myfit/api';
import { readFoodEntries } from './tools/read-food-entries';

export const chat = $state(
	new Chat<MyUIMessage>({
		transport: new DefaultChatTransport({
			api: `${PUBLIC_API_URL}/api/chat`,
			credentials: 'include',
			// The server's date can be a different day from the user's, so the app says which it is.
			prepareSendMessagesRequest: ({ id, messages, trigger, messageId }) => ({
				body: { id, messages, trigger, messageId, today: today(getLocalTimeZone()).toString() }
			})
		}),
		sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
		// Entries live on this device, so the app reads them for the model. Not awaited: the SDK
		// sends the follow-up once the answer is added.
		onToolCall: ({ toolCall }) => {
			if (!toolCall.dynamic && toolCall.toolName === 'readFoodEntries')
				void answerReadFoodEntries(toolCall);
		}
	})
);

async function answerReadFoodEntries({
	toolCallId,
	input
}: {
	toolCallId: string;
	input: Parameters<typeof readFoodEntries>[1];
}) {
	try {
		const userId = page.data.ownerId;
		if (!userId) throw new Error('No account is open.');
		const output = await readFoodEntries(userId, input);
		chat.addToolOutput({ tool: 'readFoodEntries', toolCallId, output });
	} catch (error) {
		console.error('Could not read food entries for the chat', error);
		chat.addToolOutput({
			tool: 'readFoodEntries',
			toolCallId,
			state: 'output-error',
			errorText: error instanceof Error ? error.message : 'The entries could not be read.'
		});
	}
}

export function resetChat() {
	if (chat.status !== 'ready') {
		chat.stop();
	}
	chat.messages = [];
}
