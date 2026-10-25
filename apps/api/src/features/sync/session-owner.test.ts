import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Hono } from 'hono';
import { requireSyncOwner } from './session-owner.ts';

test('sync rejects a stale tab owner after the authenticated account changes', async () => {
	const app = new Hono().all('/sync', (context) => {
		const owner = requireSyncOwner(context.req.raw, 'user-b');
		return context.json({ owner });
	});
	for (const method of ['POST', 'GET']) {
		const stale = await app.request('/sync', { method, headers: { 'X-Sync-Owner': 'user-a' } });
		assert.equal(stale.status, 401);
		const current = await app.request('/sync', { method, headers: { 'X-Sync-Owner': 'user-b' } });
		assert.equal(current.status, 200);
		assert.deepEqual(await current.json(), { owner: 'user-b' });
	}
	const legacy = await app.request('/sync');
	assert.equal(legacy.status, 200, 'older clients remain session-scoped');
});
