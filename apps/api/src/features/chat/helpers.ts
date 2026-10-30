import type { UIDataTypes, UIMessage } from 'ai';
import type { MyUITools } from './tools';

export type MyUIMessage = UIMessage<unknown, UIDataTypes, MyUITools>;

/** What the model is told when the user moved on without answering a tool call it made. */
const UNANSWERED: Record<string, string> = {
	'tool-requireClarification': 'No answer provided, continue without this information.',
	'tool-createFoodEntry':
		'Not logged: the user did not confirm it and sent another message instead.'
};

/**
 * Answers every tool call that is still waiting on the user. A model provider rejects a
 * conversation with a tool call that has no result, which is what a typed message leaves
 * behind when it replaces a pending question or food entry.
 */
export function resolveMessages(messages: MyUIMessage[]): MyUIMessage[] {
	return messages.map((message) => {
		if (message.role !== 'assistant') return message;

		return {
			...message,
			parts: message.parts.map((part) =>
				part.type in UNANSWERED && 'state' in part && part.state === 'input-available'
					? ({
							...part,
							state: 'output-available' as const,
							output: UNANSWERED[part.type]
						} as MyUIMessage['parts'][number])
					: part
			)
		} as MyUIMessage;
	});
}
