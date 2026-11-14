import { beforeEach, describe, expect, it } from 'vitest';
import type { DbClient } from '#lib/clients/idb-client.js';
import { readFoodEntries } from '#lib/features/assistant/tools/read-food-entries.js';
import { foodEntry, freshDb } from '#tests/lib/support/local-db.js';

const userId = 'u1';
let db: DbClient;
let n = 0;

/** Logs an entry eaten at noon, local time, on day `day` of October 2026, in Breakfast. */
const log = (day: number, overrides: object = {}) =>
	db.orm.foodEntry.create(
		foodEntry(userId, {
			id: `entry-${n++}`,
			productName: 'Greek yogurt',
			quantityG: 150,
			eatenAt: new Date(2026, 9, day, 12),
			energyKcal_100g: 65,
			carbohydratesG_100g: 4,
			fatG_100g: 0.4,
			proteinsG_100g: 10,
			mealId: 'breakfast',
			...overrides
		})
	);

describe('readFoodEntries', () => {
	beforeEach(async () => {
		n = 0;
		db = await freshDb(userId);
		await db.orm.meal.create({
			id: 'breakfast',
			name: 'Breakfast',
			userId,
			sortOrder: 0,
			active: true
		});
	});

	it('scales the nutrients to the amount eaten and totals each day', async () => {
		await log(30);
		await log(30, {
			productName: 'Oats',
			quantityG: 60,
			mealId: null,
			eatenAt: new Date(2026, 9, 30, 13)
		});

		const { days } = await readFoodEntries('u1', { from: '2026-10-30' });

		expect(days).toHaveLength(1);
		expect(days[0].entries[0]).toEqual({
			// The id lets the model delete it; the time is local, like the day.
			id: 'entry-0',
			time: '12:00',
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

	it('leaves the other nutrients out unless the full detail is asked for', async () => {
		await log(30, { ironMg_100g: 2 });

		const { days } = await readFoodEntries('u1', { from: '2026-10-30' });

		expect(days[0].entries[0]).not.toHaveProperty('nutrients');
		expect(days[0].totals).not.toHaveProperty('nutrients');
	});

	it('adds the recorded nutrients, scaled and totalled, for the full detail', async () => {
		await log(30, { ironMg_100g: 2, vitaminCMg_100g: null, fiberG_100g: 0 });
		await log(30, { quantityG: 50, ironMg_100g: 4, eatenAt: new Date(2026, 9, 30, 13) });

		const { days } = await readFoodEntries('u1', { from: '2026-10-30', detail: 'full' });

		expect(days[0].entries[0].nutrients).toEqual({ ironMg: 3, fiberG: 0 });
		expect(days[0].entries[1].nutrients).toEqual({ ironMg: 2 });
		expect(days[0].totals.nutrients).toEqual({ ironMg: 5, fiberG: 0 });
	});

	it('lists every day in the range, and a day with nothing logged is empty', async () => {
		await log(29);
		await log(31);

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
