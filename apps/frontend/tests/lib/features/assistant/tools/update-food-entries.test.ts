import { beforeEach, describe, expect, it } from 'vitest';
import type { DbClient } from '#lib/clients/idb-client.js';
import { planUpdates } from '#lib/features/assistant/tools/update-food-entries.js';
import { foodEntry, freshDb } from '#tests/lib/support/local-db.js';

const userId = 'u1';
const meals = [
	{ id: 'breakfast', name: 'Breakfast' },
	{ id: 'lunch', name: 'Lunch' }
];
let db: DbClient;

beforeEach(async () => {
	db = await freshDb(userId);
	for (const [sortOrder, meal] of meals.entries())
		await db.orm.meal.create({ ...meal, userId, sortOrder, active: true });
	await db.orm.foodEntry.create(
		foodEntry(userId, {
			id: 'oats',
			productName: 'Oats',
			quantityG: 100,
			energyKcal_100g: 380,
			eatenAt: new Date(2026, 10, 11, 8, 30),
			mealId: 'breakfast',
			saturatedFatG_100g: 1.2,
			unsaturatedFatG_100g: 5
		})
	);
});

describe('planUpdates', () => {
	it('writes only the fields that change, and lists ids that match nothing', async () => {
		const { updates, notFound } = await planUpdates(
			userId,
			[
				{ id: 'oats', name: 'Oats', quantityG: 150, meal: 'lunch' },
				{ id: 'gone', quantityG: 10 }
			],
			meals
		);
		expect(updates).toHaveLength(1);
		expect(updates[0].changes).toEqual({ quantityG: 150, mealId: 'lunch' });
		expect(updates[0].before).toMatchObject({ quantityG: 100, kcal: 380, meal: 'Breakfast' });
		expect(updates[0].after).toMatchObject({ quantityG: 150, kcal: 570, meal: 'Lunch' });
		expect(notFound).toEqual(['gone']);
	});

	it('sets a changed nutrient, clears one set to null, and keeps the rest', async () => {
		const { updates } = await planUpdates(
			userId,
			[{ id: 'oats', saturatedFatG_100g: 2, unsaturatedFatG_100g: null }],
			meals
		);
		expect(updates[0].changes).toEqual({ saturatedFatG_100g: 2, unsaturatedFatG_100g: null });
		expect(updates[0].before.extras).toMatchObject({
			saturatedFatG_100g: 1.2,
			unsaturatedFatG_100g: 5,
			sodiumMg_100g: null
		});
		expect(updates[0].after.extras).toMatchObject({
			saturatedFatG_100g: 2,
			unsaturatedFatG_100g: null,
			sodiumMg_100g: null
		});
	});

	it('changes nothing for a meal name the user does not have', async () => {
		const { updates } = await planUpdates(userId, [{ id: 'oats', meal: 'Brunch' }], meals);
		expect(updates[0].changes).toEqual({});
		expect(updates[0].after.meal).toBe('Breakfast');
	});
});
