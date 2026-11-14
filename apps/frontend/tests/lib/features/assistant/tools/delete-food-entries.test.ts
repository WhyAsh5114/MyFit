import { beforeEach, describe, expect, it } from 'vitest';
import type { DbClient } from '#lib/clients/idb-client.js';
import {
	findEntriesToDelete,
	summarize
} from '#lib/features/assistant/tools/delete-food-entries.js';
import { parseLocalDateTime } from '#lib/features/assistant/tools/local-time.js';
import { foodEntry, freshDb } from '#tests/lib/support/local-db.js';

const userId = 'u1';
let db: DbClient;

/** Logs an entry at `hour`:30 on 11 November 2026; morning entries are in Breakfast. */
const log = (id: string, hour: number) =>
	db.orm.foodEntry.create(
		foodEntry(userId, {
			id,
			productName: `Food ${id}`,
			quantityG: 150,
			energyKcal_100g: 200,
			eatenAt: new Date(2026, 10, 11, hour, 30),
			mealId: hour < 12 ? 'breakfast' : null
		})
	);

beforeEach(async () => {
	db = await freshDb(userId);
	await db.orm.meal.create({
		id: 'breakfast',
		name: 'Breakfast',
		userId,
		sortOrder: 0,
		active: true
	});
});

describe('findEntriesToDelete', () => {
	it('reads the entries from the device, oldest first, and lists ids that match nothing', async () => {
		await log('b', 20);
		await log('a', 8);
		const { entries, notFound } = await findEntriesToDelete('u1', ['b', 'a', 'gone']);
		expect(entries.map((e) => e.id)).toEqual(['a', 'b']);
		expect(entries[0]).toMatchObject({ name: 'Food a', kcal: 300, meal: 'Breakfast' });
		expect(entries[1].meal).toBeNull();
		expect(notFound).toEqual(['gone']);
	});

	it('summarizes a deleted entry by its local day and time', async () => {
		await log('a', 8);
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
