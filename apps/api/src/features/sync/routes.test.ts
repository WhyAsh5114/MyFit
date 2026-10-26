import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, expect, test, vi } from 'vitest';
import { Client } from 'pg';
import { clientContract } from '@myfit/schema/server';

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error('Set TEST_DATABASE_URL to a migrated test Postgres database.');

const userId = `sync-smoke-${randomUUID()}`;

// Sign-in is not under test, so the session always belongs to the test user.
vi.mock('../../shared/middleware/auth.js', () => ({
	authMiddleware: (_c: unknown, next: () => Promise<void>) => next(),
	requireSessionUserId: async () => userId
}));

const { syncRoutes } = await import('./routes.ts');
const storageHash = clientContract.storage.storageHash;
const admin = new Client({ connectionString: databaseUrl });

beforeAll(async () => {
	await admin.connect();
	await admin.query(
		`INSERT INTO "user" (id, name, email, "updatedAt") VALUES ($1, 'Sync Smoke', $2, now())`,
		[userId, `${userId}@example.com`]
	);
});

afterAll(async () => {
	await admin.query(`DELETE FROM "Changelog" WHERE "scopeKey" = $1`, [userId]);
	await admin.query(`DELETE FROM "Meal" WHERE "userId" = $1`, [userId]);
	await admin.query(`DELETE FROM "user" WHERE id = $1`, [userId]);
	await admin.end();
});

test('a pushed meal comes back from a pull from the start', async () => {
	const meal = { id: randomUUID(), name: 'Breakfast', sortOrder: 0, active: true, userId };
	const push = await syncRoutes.request('/push', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			storageHash,
			events: [{ id: randomUUID(), entityType: 'Meal', operation: 'create', payload: meal }]
		})
	});
	expect(push.status).toBe(200);
	expect(await push.json()).toMatchObject([{ success: true }]);

	const pull = await syncRoutes.request(`/pull?storageHash=${storageHash}`);
	expect(pull.status).toBe(200);
	expect(await pull.json()).toMatchObject([
		{ model: 'Meal', operation: 'create', record: { id: meal.id, name: 'Breakfast' } }
	]);
});

test('a client with a different storage hash is told to update', async () => {
	const pull = await syncRoutes.request('/pull?storageHash=stale');

	expect(pull.status).toBe(409);
});
