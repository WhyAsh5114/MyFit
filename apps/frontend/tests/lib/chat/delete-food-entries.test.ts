import { describe, expect, it, vi } from 'vitest';

const store = vi.hoisted(() => ({ rows: [] as unknown[], asked: [] as string[][] }));
vi.mock('#lib/features/food-diary/food-entry/queries/get-by-ids.js', () => ({
	getFoodEntriesByIds: async (_depends: unknown, { ids }: { ids: string[] }) => {
		store.asked.push(ids);
		return (store.rows as { id: string }[]).filter((row) => ids.includes(row.id));
	}
}));

import {
	findEntriesToDelete,
	summarize
} from '../../../src/routes/(app)/(protected)/chat/components/tools/delete-food-entries';
import { parseLocalDateTime } from '../../../src/routes/(app)/(protected)/chat/components/tools/local-time';

const row = (id: string, hour: number) => ({
	id,
	productName: `Food ${id}`,
	quantityG: 150,
	energyKcal_100g: 200,
	eatenAt: new Date(2026, 10, 11, hour, 30),
	meal: hour < 12 ? { name: 'Breakfast' } : null
});

describe('findEntriesToDelete', () => {
	it('reads the entries from the device, oldest first, and lists ids that match nothing', async () => {
		store.rows = [row('b', 20), row('a', 8)];
		const { entries, notFound } = await findEntriesToDelete('u1', ['b', 'a', 'gone']);
		expect(entries.map((e) => e.id)).toEqual(['a', 'b']);
		expect(entries[0]).toMatchObject({ name: 'Food a', kcal: 300, meal: 'Breakfast' });
		expect(entries[1].meal).toBeNull();
		expect(notFound).toEqual(['gone']);
	});

	it('summarizes a deleted entry by its local day and time', async () => {
		store.rows = [row('a', 8)];
		const { entries } = await findEntriesToDelete('u1', ['a']);
		expect(summarize(entries[0])).toEqual({
			name: 'Food a',
			quantityG: 150,
			date: '2026-11-11',
			time: '08:30'
		});
	});
});

describe('parseLocalDateTime', () => {
	it('reads the local wall-clock time the model gives', () => {
		const date = parseLocalDateTime('2026-11-10T20:15')!;
		expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 10, 10]);
		expect([date.getHours(), date.getMinutes()]).toEqual([20, 15]);
	});

	it('is null for a missing or invalid value, which means "now"', () => {
		expect(parseLocalDateTime(undefined)).toBeNull();
		expect(parseLocalDateTime(null)).toBeNull();
		expect(parseLocalDateTime('yesterday')).toBeNull();
	});
});
