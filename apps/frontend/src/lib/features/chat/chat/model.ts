import type { MyUIMessage } from '@myfit/api';

/** The longest title a chat gets from its first message. */
const TITLE_LENGTH = 60;

/** A chat's title: the start of its first typed message, or `null` before there is one. */
export function chatTitle(messages: MyUIMessage[]): string | null {
	for (const message of messages) {
		if (message.role !== 'user') continue;
		const text = message.parts
			.flatMap((part) => (part.type === 'text' ? [part.text] : []))
			.join(' ')
			.replace(/\s+/g, ' ')
			.trim();
		if (!text) continue;
		return text.length > TITLE_LENGTH ? `${text.slice(0, TITLE_LENGTH - 1).trimEnd()}…` : text;
	}
	return null;
}

/**
 * A message's parts as plain JSON, the way they are stored. Photos are already references to object
 * storage (`chat-image:<id>`), so this is small.
 */
export function storedParts(message: MyUIMessage): unknown {
	return JSON.parse(JSON.stringify(message.parts));
}
