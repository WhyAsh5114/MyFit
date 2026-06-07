import type { UIDataTypes, UIMessage } from 'ai';
import type { MyUITools } from './tools';

export type MyUIMessage = UIMessage<unknown, UIDataTypes, MyUITools>;

export function resolveMessages(messages: MyUIMessage[]): MyUIMessage[] {
	return messages.map((message) => {
		if (message.role !== 'assistant') return message;

		return {
			...message,
			parts: message.parts.map((p) =>
				p.type === 'tool-requireClarification' && p.state === 'input-available'
					? ({
							...p,
							state: 'output-available' as const,
							output: 'No answer provided, continue without this information.'
						} as MyUIMessage['parts'][number])
					: p
			)
		} as MyUIMessage;
	});
}
