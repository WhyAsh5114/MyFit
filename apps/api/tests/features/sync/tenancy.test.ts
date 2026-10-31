import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, expect, test, vi } from 'vitest';
import { Client } from 'pg';
import { clientContract } from '@myfit/shared/server';

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error('Set TEST_DATABASE_URL to a migrated test Postgres database.');

const attacker = `tenancy-a-${randomUUID()}`;
const victim = `tenancy-b-${randomUUID()}`;
const victimMeal = randomUUID();

// The session always belongs to the attacker, who tries to reach the victim's rows.
vi.mock('../../../src/shared/middleware/auth.js', () => ({
	authMiddleware: (_c: unknown, next: () => Promise<void>) => next(),
	requireSessionUserId: async () => attacker
}));

const { syncRoutes } = await import('../../../src/features/sync/routes.ts');
const storageHash = clientContract.storage.storageHash;
const admin = new Client({ connectionString: databaseUrl });

beforeAll(async () => {
	await admin.connect();
	for (const id of [attacker, victim]) {
		await admin.query(
			`INSERT INTO "user" (id, name, email, "updatedAt") VALUES ($1, 'Tenancy', $2, now())`,
			[id, `${id}@example.com`]
		);
	}
	await admin.query(
		`INSERT INTO "Meal" (id, name, "sortOrder", active, "userId") VALUES ($1, 'victim', 0, true, $2)`,
		[victimMeal, victim]
	);
});

afterAll(async () => {
	const users = [attacker, victim];
	await admin.query(`DELETE FROM "Changelog" WHERE "scopeKey" = ANY($1)`, [users]);
	await admin.query(`DELETE FROM "Meal" WHERE "userId" = ANY($1)`, [users]);
	await admin.query(`DELETE FROM "user" WHERE id = ANY($1)`, [users]);
	await admin.end();
});

async function push(event: { operation: string; payload: unknown }) {
	const response = await syncRoutes.request('/push', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			storageHash,
			events: [{ id: randomUUID(), entityType: 'Meal', ...event }]
		})
	});
	expect(response.status).toBe(200);
	return response.json();
}

const victimRow = async () =>
	(await admin.query(`SELECT name, "userId" FROM "Meal" WHERE id = $1`, [victimMeal])).rows[0];

test("a user can't create a row that belongs to someone else", async () => {
	const id = randomUUID();

	const result = await push({
		operation: 'create',
		payload: { id, name: 'planted', sortOrder: 0, active: true, userId: victim }
	});

	expect(result).toMatchObject([{ success: false, error: 'SCOPE_VIOLATION' }]);
	expect((await admin.query(`SELECT 1 FROM "Meal" WHERE id = $1`, [id])).rowCount).toBe(0);
});

test("a user can't update someone else's row", async () => {
	const result = await push({
		operation: 'update',
		payload: { key: victimMeal, patch: { name: 'pwned' } }
	});

	expect(result).toMatchObject([{ success: false, error: 'SCOPE_VIOLATION' }]);
	expect(await victimRow()).toEqual({ name: 'victim', userId: victim });
});

test("a user can't take over someone else's row by changing its owner", async () => {
	const result = await push({
		operation: 'update',
		payload: { key: victimMeal, patch: { userId: attacker } }
	});

	expect(result).toMatchObject([{ success: false, error: 'SCOPE_VIOLATION' }]);
	expect(await victimRow()).toEqual({ name: 'victim', userId: victim });
});

test("a user can't delete someone else's row", async () => {
	const result = await push({ operation: 'delete', payload: { key: victimMeal } });

	expect(result).toMatchObject([{ success: false, error: 'SCOPE_VIOLATION' }]);
	expect(await victimRow()).toBeDefined();
});

test("a pull never returns someone else's rows", async () => {
	const pull = await syncRoutes.request(`/pull?storageHash=${storageHash}`);
	const body = JSON.stringify(await pull.json());

	expect(pull.status).toBe(200);
	expect(body).not.toContain(victim);
	expect(body).not.toContain(victimMeal);
});
