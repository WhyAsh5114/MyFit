import 'fake-indexeddb/auto';
import { getDb, resetDb, type DbClient } from '#lib/clients/idb-client.js';

/**
 * Deletes the app's database and opens it again with one user, so a test of code that calls
 * `getDb()` (readers, mutations, chat tools) starts from an empty diary. Call it in `beforeEach`.
 */
export async function freshDb(userId: string): Promise<DbClient> {
	await resetDb();
	const db = await getDb();
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

/** A food entry with only the fields a test cares about set; the rest are plain defaults. */
export const foodEntry = (
	userId: string,
	fields: { id: string; eatenAt: Date } & Record<string, unknown>
) => ({
	productName: 'Food',
	brands: null,
	preferredUnit: 'g' as const,
	servingQuantity: null,
	servingSize: null,
	quantityG: 100,
	mealId: null,
	recipeId: null,
	energyKcal_100g: 100,
	proteinsG_100g: 0,
	fatG_100g: 0,
	carbohydratesG_100g: 0,
	...fields,
	userId
});
