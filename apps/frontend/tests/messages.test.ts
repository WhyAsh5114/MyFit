import { describe, expect, it } from 'vitest';
import en from '../messages/en.json';
import hi from '../messages/hi.json';

/** The `{name}` parameters a message takes. */
const params = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

const languages = { hi } satisfies Record<string, Record<string, string>>;

describe.each(Object.entries(languages))('messages/%s.json', (_, messages) => {
	// Paraglide falls back to English for a missing key, so a gap shows English on a Hindi screen.
	it('has exactly the keys en.json has', () => {
		expect(Object.keys(messages).sort()).toEqual(Object.keys(en).sort());
	});

	it('keeps the parameters of every English message', () => {
		const mismatched = Object.entries(en).filter(
			([key, text]) =>
				key in messages &&
				params(messages[key as keyof typeof messages]).join() !== params(text).join()
		);
		expect(mismatched.map(([key]) => key)).toEqual([]);
	});
});
