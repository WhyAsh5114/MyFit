import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { createManagedAutoSyncIdbClient } from '@prisma-idb/sync-extension-idb/client';
import { idbSyncExtension } from '@prisma-idb/sync-extension-idb/control';
import { contractSpace, type Contract } from '@myfit/schema/client';
import { AccountDatabase, OWNER_STORAGE_KEY, type DbClient } from './idb-client.ts';

/** Supplies persistent storage shared by simulated tabs without requiring a browser. */
function createStorage() {
	const values = new Map<string, string>();
	return {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => {
			values.set(key, value);
		}
	};
}

/** Seeds the same server-owned identity row as session caching, without queuing it. */
async function cacheUser(db: DbClient, id: string) {
	await db.withoutTracking((orm) =>
		orm.user.create({
			id,
			name: id,
			email: `${id}@example.test`,
			updatedAt: new Date()
		})
	);
}

afterEach(async () => {
	for (const { name } of await indexedDB.databases()) {
		if (!name) continue;
		await new Promise<void>((resolve, reject) => {
			const request = indexedDB.deleteDatabase(name);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}
});

test('logout preserves an offline edit and its outbox until its owner signs in again', async () => {
	const storage = createStorage();
	const accounts = new AccountDatabase(storage);
	try {
		const db = (await accounts.activate('user-a'))!;
		await cacheUser(db, 'user-a');
		await db.orm.activityEntry.create({
			id: 'offline-walk',
			userId: 'user-a',
			name: 'Walk',
			performedAt: new Date(),
			calories: 100,
			quantity: 1,
			quantityUnit: 'session'
		});
		assert.equal(await db.outbox.pendingCount(), 1);

		await accounts.deactivate();
		await assert.rejects(accounts.get(), /No active local account/);
		const reloaded = new AccountDatabase(storage);
		assert.equal(await reloaded.activate(), null, 'explicit logout disables offline access');
		try {
			const reopened = (await reloaded.activate('user-a'))!;
			assert.equal(
				(await reopened.orm.activityEntry.where({ id: 'offline-walk' }).first())?.calories,
				100
			);
			assert.equal(await reopened.outbox.pendingCount(), 1);
		} finally {
			await reloaded.deactivate();
		}
	} finally {
		await accounts.deactivate();
	}
});

test('expired legacy account stays offline-capable and never shares rows or queued writes with a new login', async () => {
	const legacy = createManagedAutoSyncIdbClient<Contract>({
		contractSpace,
		dbName: 'myfit',
		extensions: [idbSyncExtension]
	});
	try {
		const db = await legacy.get();
		await cacheUser(db, 'user-a');
		await db.orm.meal.create({ name: 'Offline meal', sortOrder: 0, userId: 'user-a' });
	} finally {
		await legacy.close();
	}

	const accounts = new AccountDatabase(createStorage());
	try {
		const offline = (await accounts.activate())!;
		assert.equal(accounts.ownerId, 'user-a');
		assert.equal(await offline.outbox.pendingCount(), 1);
		const next = (await accounts.activate('user-b'))!;
		assert.deepEqual(await next.orm.user.all(), []);
		assert.deepEqual(await next.orm.meal.all(), []);
		assert.equal(await next.outbox.pendingCount(), 0);
		await cacheUser(next, 'user-b');

		const original = (await accounts.activate('user-a'))!;
		assert.deepEqual(
			(await original.orm.user.all()).map((user) => user.id),
			['user-a']
		);
		assert.equal((await original.orm.meal.all())[0]?.name, 'Offline meal');
		assert.equal(await original.outbox.pendingCount(), 1);
	} finally {
		await accounts.deactivate();
	}
});

test('refuses to assign an already mixed legacy database and keeps its data intact', async () => {
	const legacy = createManagedAutoSyncIdbClient<Contract>({
		contractSpace,
		dbName: 'myfit',
		extensions: [idbSyncExtension]
	});
	try {
		const db = await legacy.get();
		await cacheUser(db, 'user-a');
		await cacheUser(db, 'user-b');
		const accounts = new AccountDatabase(createStorage());
		await assert.rejects(accounts.activate('user-b'), /multiple accounts/);
		assert.deepEqual(
			(await db.orm.user.all()).map((user) => user.id),
			['user-a', 'user-b']
		);
	} finally {
		await legacy.close();
	}
});

test('a tab loses database access when another tab changes the active owner', async () => {
	const storage = createStorage();
	const accounts = new AccountDatabase(storage);
	try {
		await accounts.activate('user-a');
		storage.setItem(OWNER_STORAGE_KEY, 'user-b');
		await assert.rejects(accounts.get(), /No active local account/);
	} finally {
		await accounts.deactivate();
	}
});
