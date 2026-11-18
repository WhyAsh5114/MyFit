import { describe, expect, it } from 'vitest';
import { reuseUnchanged } from '#lib/features/assistant/chat/stable-parts.js';

describe('reuseUnchanged', () => {
	it('keeps the previous object for an unchanged item, and takes the new one for a changed item', () => {
		const previous = [
			{ type: 'tool', input: { name: 'Oats' } },
			{ type: 'text', text: 'Log' }
		];
		const next = [
			{ type: 'tool', input: { name: 'Oats' } },
			{ type: 'text', text: 'Logged' }
		];
		const result = reuseUnchanged(previous, next);
		expect(result[0]).toBe(previous[0]);
		expect(result[1]).toBe(next[1]);
	});

	it('takes items that are new', () => {
		const previous = [{ type: 'text', text: 'Hi' }];
		const next = [{ type: 'text', text: 'Hi' }, { type: 'reasoning' }];
		const result = reuseUnchanged(previous, next);
		expect(result).toEqual(next);
		expect(result[0]).toBe(previous[0]);
		expect(result[1]).toBe(next[1]);
	});
});
