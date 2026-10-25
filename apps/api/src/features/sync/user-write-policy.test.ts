import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Hono } from 'hono';
import { enforceUserWritePolicy } from './user-write-policy.ts';

// The downstream response stands in for the SQL handler at the HTTP boundary.
const app = new Hono().post('/push', enforceUserWritePolicy, async (c) =>
	c.json(await c.req.json(), 202)
);

/** Sends the same wire envelope used by the sync client. */
function push(events: unknown[]) {
	return app.request('/push', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ storageHash: 'current-contract', events })
	});
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

test('passes profile and preference updates to the adapter with their body intact', async () => {
	const events = [updateUser({ name: 'New name', image: null, autoUpdate: false })];
	const response = await push(events);
	assert.equal(response.status, 202);
	assert.deepEqual(await response.json(), { storageHash: 'current-contract', events });
});

test('rejects account creation and deletion through sync', async () => {
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
	const meal = {
		id: 'create-meal',
		entityType: 'Meal',
		operation: 'create',
		payload: { id: 'meal-a', name: 'Breakfast', userId: 'user-a' }
	};
	const allowed = await push([meal]);
	assert.equal(allowed.status, 202);
	const forbidden = await push([meal, updateUser({ emailVerified: true })]);
	assert.equal(forbidden.status, 403);
});
