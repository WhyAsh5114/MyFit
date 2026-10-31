import { beforeEach, describe, expect, it, vi } from 'vitest';

const entries = vi.hoisted(() => ({ rows: [] as unknown[] }));
vi.mock('#lib/features/food-diary/food-entry/queries/get-by-range.js', () => ({
	getFoodEntriesByRange: async () => entries.rows
}));

import { readFoodEntries } from '../../../src/routes/(app)/(protected)/chat/components/tools/read-food-entries';

/** An entry eaten at noon, local time, on day `day` of October 2026. */
const entry = (day: number, overrides: object = {}) => ({
	productName: 'Greek yogurt',
	quantityG: 150,
	eatenAt: new Date(2026, 9, day, 12),
	energyKcal_100g: 65,
	carbohydratesG_100g: 4,
	fatG_100g: 0.4,
	proteinsG_100g: 10,
	meal: { name: 'Breakfast' },
	...overrides
});

describe('readFoodEntries', () => {
	beforeEach(() => {
		entries.rows = [];
	});

	it('scales the nutrients to the amount eaten and totals each day', async () => {
		entries.rows = [entry(30), entry(30, { productName: 'Oats', quantityG: 60, meal: null })];

		const { days } = await readFoodEntries('u1', { from: '2026-10-30' });

		expect(days).toHaveLength(1);
		expect(days[0].entries[0]).toEqual({
			name: 'Greek yogurt',
			quantityG: 150,
			meal: 'Breakfast',
			kcal: 97.5,
			carbsG: 6,
			fatG: 0.6,
			proteinG: 15
		});
		expect(days[0].entries[1].meal).toBeNull();
		expect(days[0].totals.kcal).toBe(97.5 + 39);
	});

	it('lists every day in the range, and a day with nothing logged is empty', async () => {
		entries.rows = [entry(29), entry(31)];

		const { days } = await readFoodEntries('u1', { from: '2026-10-29', to: '2026-10-31' });

		expect(days.map((day) => [day.date, day.entries.length])).toEqual([
			['2026-10-29', 1],
			['2026-10-30', 0],
			['2026-10-31', 1]
		]);
		expect(days[1].totals).toEqual({ kcal: 0, carbsG: 0, fatG: 0, proteinG: 0 });
	});

	it('refuses a range the model can act on', async () => {
		await expect(readFoodEntries('u1', { from: '2026-10-31', to: '2026-10-30' })).rejects.toThrow(
			'before the first'
		);
		await expect(readFoodEntries('u1', { from: '2026-09-01', to: '2026-10-31' })).rejects.toThrow(
			'at most 31 days'
		);
		await expect(readFoodEntries('u1', { from: 'yesterday' })).rejects.toThrow();
	});
});
