import { describe, expect, it } from 'vitest';
import { chatTitle } from '#lib/features/chat/chat/model.js';

const user = (...parts: object[]) => ({ id: 'u', role: 'user', parts }) as never;

describe('chatTitle', () => {
	it('is the first typed message, on one line', () => {
		expect(chatTitle([user({ type: 'text', text: '  I ate\n two eggs ' })])).toBe('I ate two eggs');
	});

	it('skips a message with only a photo, and is null before any text', () => {
		const photo = { type: 'file', mediaType: 'image/jpeg', url: 'chat-image:x' };
		expect(chatTitle([user(photo)])).toBeNull();
		expect(chatTitle([user(photo), user({ type: 'text', text: 'what is this?' })])).toBe(
			'what is this?'
		);
	});

	it('shortens a long message', () => {
		const title = chatTitle([user({ type: 'text', text: 'word '.repeat(40) })]);
		expect(title!.length).toBeLessThanOrEqual(60);
		expect(title!.endsWith('…')).toBe(true);
	});
});
