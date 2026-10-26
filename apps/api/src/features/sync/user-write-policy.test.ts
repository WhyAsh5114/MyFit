import assert from 'node:assert/strict';
import { test } from 'vitest';
import { Hono } from 'hono';

import postgres from '@prisma/orm-postgres/runtime';
import { createSqlSync } from '@prisma-idb/sync-server-sql';
import type { ServerContract } from '@myfit/schema/server';
import type { Contract as ClientContract } from '@myfit/schema/client';
import serverJson from '../../../../../packages/schema/src/schema.postgres.generated.json' with { type: 'json' };
import clientJson from '../../../../../packages/schema/src/contract.json' with { type: 'json' };
import { writePolicies } from './write-policies.ts';

const serverContract = serverJson as unknown as ServerContract;
const clientContract = clientJson as unknown as ClientContract;

/** A stored row in the database stand-in. */
type Row = Record<string, unknown>;

/** Implements the ORM operations used here, retaining rows so tests can inspect writes. */
function table(rows: Row[], where: Row = {}) {
	const matches = (row: Row) => Object.entries(where).every(([key, value]) => row[key] === value);
	return {
		first: (filter: Row) =>
			rows.find((row) => Object.entries(filter).every(([key, value]) => row[key] === value)),
		select: () => table(rows, where),
		where: (filter: Row) => table(rows, filter),
		orderBy: () => table(rows, where),
		limit: () => table(rows, where),
		all: () => rows.filter(matches).toReversed(),
		create: (row: Row) => rows.push(row),
		update: (patch: Row) => rows.filter(matches).forEach((row) => Object.assign(row, patch))
	};
}

/** Uses real contracts and HTTP handlers; only the database boundary is in memory. */
function fixture() {
	const user = {
		id: 'user-a',
		name: 'Old name',
		image: 'old.png',
		autoUpdate: true,
		emailVerified: false
	};
	const meals: Row[] = [];
	const changelog: Row[] = [];
	const scope = {
		orm: { public: { User: table([user]), Meal: table(meals), Changelog: table(changelog) } },
		// These tests do not simulate lock contention or isolation failures.
		query: () => [{ present: 1, level: 'read committed' }]
	};
	const db = {
		...scope,
		raw: postgres<ServerContract>({ contractJson: serverContract }).raw,
		transaction: async (work: (tx: typeof scope) => Promise<unknown>) => work(scope)
	};
	const handlers = createSqlSync({
		contract: serverContract,
		clientContract,
		rootModel: 'User',
		db,
		scopeKey: 'user-a',
		writePolicies
	});
	const app = new Hono().post('/push', (c) => handlers.push(c.req.raw));

	/** Sends the same wire envelope used by the sync client. */
	function push(events: unknown[]) {
		return app.request('/push', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ storageHash: clientContract.storage.storageHash, events })
		});
	}
	return { push, user, meals, changelog };
}

/** Builds an update for the authenticated user's row. */
function updateUser(patch: Record<string, unknown>) {
	return {
		id: 'update-user',
		entityType: 'User',
		operation: 'update',
		payload: { key: 'user-a', patch }
	};
}

test('rejects identity changes, including mixed profile and identity patches', async () => {
	const { push } = fixture();
	for (const patch of [
		{ email: 'other@example.test' },
		{ emailVerified: true },
		{ isAnonymous: false },
		{ name: 'New name', email: 'other@example.test', emailVerified: true },
		{ createdAt: '2026-01-01T00:00:00Z' },
		{ updatedAt: '2026-01-01T00:00:00Z' },
		{ futureAuthField: true }
	]) {
		const response = await push([updateUser(patch)]);
		assert.equal(response.status, 403, JSON.stringify(patch));
	}
});

test('applies profile and preference updates through the SQL adapter', async () => {
	const { push, user, changelog } = fixture();
	const patch = { name: 'New name', image: null, autoUpdate: false };
	const response = await push([updateUser(patch)]);
	assert.equal(response.status, 200);
	assert.deepEqual(await response.json(), [{ id: 'update-user', success: true }]);
	assert.deepEqual(user, { id: 'user-a', emailVerified: false, ...patch });
	assert.equal(changelog.length, 1);
});

test('rejects account creation and deletion through sync', async () => {
	const { push } = fixture();
	for (const operation of ['create', 'delete']) {
		const response = await push([
			{
				id: 'account-write',
				entityType: 'User',
				operation,
				payload: { id: 'user-a', key: 'user-a', emailVerified: true }
			}
		]);
		assert.equal(response.status, 403, operation);
	}
});

test('rejects a whole batch containing a forbidden write even after a permitted event', async () => {
	const allowed = fixture();
	const forbidden = fixture();
	const meal = {
		id: 'create-meal',
		entityType: 'Meal',
		operation: 'create',
		payload: { id: 'meal-a', name: 'Breakfast', userId: 'user-a', active: true, sortOrder: 0 }
	};
	const permitted = await allowed.push([meal]);
	assert.equal(permitted.status, 200);
	assert.deepEqual(await permitted.json(), [{ id: 'create-meal', success: true }]);
	assert.equal(allowed.meals.length, 1);
	const rejected = await forbidden.push([meal, updateUser({ emailVerified: true })]);
	assert.equal(rejected.status, 403);
	assert.deepEqual(await rejected.json(), {
		ok: false,
		reason: 'write-policy-violation',
		eventId: 'update-user'
	});
	assert.deepEqual(forbidden.meals, []);
	assert.deepEqual(forbidden.changelog, []);
	assert.equal(forbidden.user.emailVerified, false);
});
