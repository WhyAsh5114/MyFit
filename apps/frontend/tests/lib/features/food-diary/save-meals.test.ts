import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createManagedAutoSyncIdbClient } from '@prisma-idb/sync-extension-idb/client';
import { idbSyncExtension } from '@prisma-idb/sync-extension-idb/control';
import { contractSpace, type Contract } from '@myfit/shared/client';
import { saveMeals } from '../../../../src/lib/features/food-diary/meals/save-meals';

const userId = 'u1';
let n = 0;

/** A fresh database with one user, so every test starts from the same place. */
async function openDb() {
	const managed = createManagedAutoSyncIdbClient<Contract>({
		contractSpace,
		dbName: `save-meals-${n++}`,
		extensions: [idbSyncExtension]
	});
	const db = await managed.get();
	await db.withoutTracking((orm) =>
		orm.user.create({
			id: userId,
			name: 'n',
			email: 'e@example.test',
			emailVerified: true,
			image: null,
			createdAt: new Date(),
			updatedAt: new Date(),
			isAnonymous: null
		})
	);
	return db;
}

type Db = Awaited<ReturnType<typeof openDb>>;
let db: Db;

const seed = (id: string, name: string, sortOrder: number, active = true) =>
	db.orm.meal.create({ id, name, userId, sortOrder, active });
const save = (meals: { id: string; name: string }[]) =>
	db.transaction(['meal'], (tx) => saveMeals(tx, userId, meals));
const state = async () =>
	(await db.orm.meal.where({ userId }).orderBy({ sortOrder: 'asc' }).all()).map(
		({ id, name, sortOrder, active }) => ({ id, name, sortOrder, active })
	);

beforeEach(async () => {
	db = await openDb();
});

describe('saveMeals', () => {
	it('renames a meal in place, keeping its id', async () => {
		await seed('m1', 'Breakfast', 0);
		await seed('m2', 'Lunch', 1);

		await save([
			{ id: 'm1', name: 'Morning' },
			{ id: 'm2', name: 'Lunch' }
		]);

		expect(await state()).toEqual([
			{ id: 'm1', name: 'Morning', sortOrder: 0, active: true },
			{ id: 'm2', name: 'Lunch', sortOrder: 1, active: true }
		]);
	});

	it('lets two meals swap names', async () => {
		await seed('m1', 'A', 0);
		await seed('m2', 'B', 1);

		await save([
			{ id: 'm1', name: 'B' },
			{ id: 'm2', name: 'A' }
		]);

		expect(await state()).toEqual([
			{ id: 'm1', name: 'B', sortOrder: 0, active: true },
			{ id: 'm2', name: 'A', sortOrder: 1, active: true }
		]);
	});

	it('creates new meals and reorders existing ones', async () => {
		await seed('m1', 'Lunch', 0);

		await save([
			{ id: 'new', name: 'Breakfast' },
			{ id: 'm1', name: 'Lunch' }
		]);

		expect(await state()).toEqual([
			{ id: 'new', name: 'Breakfast', sortOrder: 0, active: true },
			{ id: 'm1', name: 'Lunch', sortOrder: 1, active: true }
		]);
	});

	it('archives a removed meal instead of deleting it', async () => {
		await seed('m1', 'Breakfast', 0);
		await seed('m2', 'Snack', 1);

		await save([{ id: 'm1', name: 'Breakfast' }]);

		const meals = await state();
		expect(meals.find((meal) => meal.id === 'm2')).toMatchObject({ name: 'Snack', active: false });
		expect(meals.find((meal) => meal.id === 'm1')?.active).toBe(true);
	});

	it('brings an archived meal back when a new one takes its name', async () => {
		await seed('m1', 'Snack', 0, false);

		await save([{ id: 'fresh', name: 'Snack' }]);

		expect(await state()).toEqual([{ id: 'm1', name: 'Snack', sortOrder: 0, active: true }]);
	});

	it('moves an archived meal aside when a renamed meal takes its name', async () => {
		await seed('m1', 'Dinner', 0);
		await seed('old-snack', 'Snack', 1, false);

		await save([{ id: 'm1', name: 'Snack' }]);

		const meals = await state();
		expect(meals.find((meal) => meal.id === 'm1')).toMatchObject({ name: 'Snack', active: true });
		expect(meals.find((meal) => meal.id === 'old-snack')).toMatchObject({ active: false });
		expect(meals.find((meal) => meal.id === 'old-snack')?.name).not.toBe('Snack');
	});
});
