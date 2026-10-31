import { describe, expect, it } from 'vitest';
import { localRedirect } from '../../../../src/lib/services/account/redirect';

const origin = 'https://myfit.fit';

describe('localRedirect', () => {
	it('keeps a path on this origin, with its query and hash', () => {
		expect(localRedirect('/food-diary/2026-10-31?x=1#top', origin)).toBe(
			'/food-diary/2026-10-31?x=1#top'
		);
	});

	it('falls back when there is nothing to go back to', () => {
		expect(localRedirect(null, origin)).toBe('/dashboard');
		expect(localRedirect('', origin)).toBe('/dashboard');
		expect(localRedirect('food-diary', origin)).toBe('/dashboard');
	});

	it.each(['//evil.com', '/\\evil.com', '/\\/evil.com', 'https://evil.com', '/\t/evil.com'])(
		'refuses %j, which leaves the origin',
		(back) => {
			expect(localRedirect(back, origin)).toBe('/dashboard');
		}
	);

	it('uses the given fallback', () => {
		expect(localRedirect('//evil.com', origin, '/login')).toBe('/login');
	});
});
