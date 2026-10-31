import { afterEach, describe, expect, it } from 'vitest';
import { momentOnDay } from '../../../../src/lib/features/food-diary/_common/day-bounds';

const original = process.env.TZ;
afterEach(() => {
	process.env.TZ = original;
});

const local = (d: Date) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ` +
	`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

describe('momentOnDay', () => {
	// The old `new Date('2026-10-31')` + setHours put the entry on the 30th west of UTC.
	it.each([
		'Asia/Kolkata',
		'UTC',
		'Europe/Madrid',
		'America/New_York',
		'America/Los_Angeles',
		'America/Sao_Paulo',
		'Pacific/Auckland'
	])('stays on the diary day in %s', (zone) => {
		process.env.TZ = zone;
		const now = new Date(2026, 9, 31, 15, 20, 5, 7);

		expect(local(momentOnDay('2026-10-31', now))).toBe('2026-10-31 15:20');
		expect(local(momentOnDay('2026-01-01', now))).toBe('2026-01-01 15:20');
	});

	it('is now without a day, or with one that is not a date', () => {
		const now = new Date(2026, 9, 31, 15, 20);

		expect(momentOnDay(undefined, now)).toBe(now);
		expect(momentOnDay('not-a-date', now)).toBe(now);
	});
});
