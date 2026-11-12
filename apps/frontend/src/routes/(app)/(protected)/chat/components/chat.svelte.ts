import { Chat } from '@ai-sdk/svelte';
import { getLocalTimeZone, now, today } from '@internationalized/date';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { createContext } from 'svelte';

import { PUBLIC_API_URL } from '$app/env/public';
import type { MyUIMessage, MyUITools } from '@myfit/api';
import { apiClient } from '#lib/clients/api-client.js';
import { useSaveChat } from '#lib/features/chat/chat/mutations/save.js';
import { storedParts } from '#lib/features/chat/chat/model.js';
import { onAccountChange } from '#lib/services/account/account-session.svelte.js';
import { readFoodEntries } from './tools/read-food-entries';

/** The tools the app answers; the server answers the rest. */
type AppTool = 'requireClarification' | 'createFoodEntry' | 'readFoodEntries';

type ToolOutput = {
	[K in AppTool]: { tool: K; toolCallId: string; output: MyUITools[K]['output'] };
}[AppTool];

/**
 * One open conversation: the AI SDK chat and the saving of its messages. Messages are saved after
 * a send, after each tool answer, and when a response finishes, so a conversation keeps saving when
 * the user leaves the page while it streams.
 */
export class ChatSession {
	readonly chat: Chat<MyUIMessage>;
	/** The stored JSON of each saved message, so a save writes only what changed. */
	readonly #saved: Map<string, string>;
	readonly #save = useSaveChat();
	#saving: Promise<unknown> = Promise.resolve();
	/** Set once the chat is deleted, so a response still finishing can't save it back. */
	#discarded = false;

	constructor(
		readonly id: string,
		readonly userId: string,
		messages: MyUIMessage[],
		/** The user's meal names, sent with each request so the model can pick one. */
		getMeals: () => string[]
	) {
		// Bookkeeping for saves, never rendered, so it needn't be reactive.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		this.#saved = new Map(
			messages.map((message) => [message.id, JSON.stringify(storedParts(message))])
		);
		this.chat = new Chat<MyUIMessage>({
			id,
			messages: structuredClone(messages),
			transport: new DefaultChatTransport({
				api: `${PUBLIC_API_URL}/api/chat`,
				credentials: 'include',
				// The server's date can be a different day from the user's, so the app says which it is,
				// with the local time and the meals, so a food entry lands in the right meal.
				prepareSendMessagesRequest: ({ id, messages, trigger, messageId }) => {
					const time = now(getLocalTimeZone());
					return {
						body: {
							id,
							messages,
							trigger,
							messageId,
							today: today(getLocalTimeZone()).toString(),
							time: `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`,
							meals: getMeals()
						}
					};
				}
			}),
			sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
			// Entries live on this device, so the app reads them for the model. Not awaited: the SDK
			// sends the follow-up once the answer is added.
			onToolCall: ({ toolCall }) => {
				if (toolCall.dynamic) return;
				if (toolCall.toolName === 'readFoodEntries') void this.#answerReadFoodEntries(toolCall);
			},
			onFinish: () => this.persist()
		});
	}

	/**
	 * Sends a typed message and saves it right away, before the answer arrives. A new chat is also
	 * named from its first message, which doesn't hold up the answer.
	 */
	send(message: Parameters<Chat<MyUIMessage>['sendMessage']>[0]) {
		const isFirst = this.chat.messages.length === 0;
		const sent = this.chat.sendMessage(message);
		this.persist();
		if (isFirst) void this.#requestTitle();
		return sent;
	}

	/** Answers a tool call the app or the user resolves, then saves the answer. */
	async answer(output: ToolOutput) {
		await this.chat.addToolOutput(output);
		this.persist();
	}

	/**
	 * Queues a save of the conversation as it is now, with a generated `title` when one arrived.
	 * Saves run one at a time, in order.
	 */
	persist(title?: string) {
		if (this.#discarded) return;
		const messages = $state.snapshot(this.chat.messages) as MyUIMessage[];
		if (messages.length === 0) return;
		this.#saving = this.#saving
			.then(() =>
				this.#save.mutateAsync({
					userId: this.userId,
					chatId: this.id,
					messages,
					saved: this.#saved,
					title
				})
			)
			// The mutation already showed a toast. The next save retries what this one missed.
			.catch(() => {});
	}

	/** Stops a response in progress without saving anything again: the chat was deleted. */
	discard() {
		this.#discarded = true;
		if (this.chat.status === 'submitted' || this.chat.status === 'streaming') this.chat.stop();
	}

	/** Stops a response in progress and saves what arrived. */
	close() {
		if (this.chat.status === 'submitted' || this.chat.status === 'streaming') this.chat.stop();
		this.persist();
	}

	/** Asks the server for a title and saves it. A chat without one keeps the start of its message. */
	async #requestTitle() {
		const text = this.chat.messages
			.find((message) => message.role === 'user')
			?.parts.flatMap((part) => (part.type === 'text' ? [part.text] : []))
			.join('\n')
			.trim();
		if (!text) return;
		try {
			const response = await apiClient.api.chat.title.$post({ json: { text } });
			if (!response.ok) return;
			const { title } = await response.json();
			if (title) this.persist(title);
		} catch (error) {
			console.warn('Could not name the chat', error);
		}
	}

	async #answerReadFoodEntries({
		toolCallId,
		input
	}: {
		toolCallId: string;
		input: Parameters<typeof readFoodEntries>[1];
	}) {
		try {
			const output = await readFoodEntries(this.userId, input);
			await this.answer({ tool: 'readFoodEntries', toolCallId, output });
		} catch (error) {
			console.error('Could not read food entries for the chat', error);
			await this.chat.addToolOutput({
				tool: 'readFoodEntries',
				toolCallId,
				state: 'output-error',
				errorText: error instanceof Error ? error.message : 'The entries could not be read.'
			});
			this.persist();
		}
	}
}

/**
 * The open conversation. A plain variable, not state: it is read while deriving the page's session,
 * which must not write state.
 */
let current: ChatSession | null = null;

/**
 * The session for a chat, reusing the open one so a conversation in progress survives leaving the
 * page and coming back. Opening another chat stops the previous one's response and saves it.
 */
export function openChat(
	id: string,
	userId: string,
	messages: MyUIMessage[],
	getMeals: () => string[]
): ChatSession {
	if (current?.id === id && current.userId === userId) return current;
	const previous = current;
	// Stopping writes the previous chat's state, so it waits until the page has finished deriving.
	if (previous) queueMicrotask(() => previous.close());
	current = new ChatSession(id, userId, messages, getMeals);
	return current;
}

/** The chat that was open last, so the Chat tab returns to it. */
export const lastChatId = () => current?.id;

/** Drops a deleted chat's session, so neither the Chat tab nor a late save brings it back. */
export function forgetChat(id: string) {
	if (current?.id !== id) return;
	current.discard();
	current = null;
}

// The conversation holds the diary's content, so another account must not see it. The page isn't
// reloaded on a logout or a switch.
onAccountChange(() => {
	const previous = current;
	current = null;
	if (previous?.chat.status === 'submitted' || previous?.chat.status === 'streaming')
		previous.chat.stop();
});

type ChatPageContext = {
	readonly session: ChatSession;
	/** The user's active meals, for the meal picker on a food entry card. */
	readonly meals: { id: string; name: string }[];
};

export const [getChatPageContext, setChatPageContext] = createContext<ChatPageContext>();
