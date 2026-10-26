import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { afterEach, test } from 'vitest';
import { createManagedAutoSyncIdbClient } from '@prisma-idb/sync-extension-idb/client';
import { idbSyncExtension } from '@prisma-idb/sync-extension-idb/control';
import { contractSpace, type Contract } from '@myfit/schema/client';
import { createAuthClient } from 'better-auth/svelte';
import { AccountDatabase, OWNER_STORAGE_KEY, type DbClient } from './idb-client.ts';
import { flushLogoutChanges, logoutAccount, signOutAndRefreshSession } from '../features/logout.ts';

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

/** Queues a realistic edit and uses the actual sync worker to exercise logout ordering. */
async function createOfflineAccount() {
	const storage = createStorage();
	const accounts = new AccountDatabase(storage);
	const db = (await accounts.activate('user-a'))!;
	await cacheUser(db, 'user-a');
	await db.orm.meal.create({ name: 'Offline meal', sortOrder: 0, userId: 'user-a' });
	return { storage, accounts, db };
}

/** Exercises real outbox acknowledgement with an in-memory server transport. */
async function syncChanges(
	db: DbClient,
	pushHandler: Parameters<DbClient['createSyncWorker']>[0]['pushHandler'] = async (events) =>
		events.map(({ id }) => ({ id, success: true }))
) {
	await flushLogoutChanges(
		db.createSyncWorker({ pushHandler, pullHandler: async () => [], backoffBaseMs: 0 })
	);
}

/** Keeps the real auth client's cached session stale until its post-sign-out refetch finishes. */
function createLogoutAuth(readSignedOutSession: () => Promise<Response>) {
	let signedIn = true;
	return createAuthClient({
		baseURL: 'https://auth.example.test',
		fetchOptions: {
			customFetchImpl: async (input) => {
				const path = new URL(String(input)).pathname;
				if (path.endsWith('/sign-out')) {
					signedIn = false;
					return Response.json({ success: true });
				}
				assert.ok(path.endsWith('/get-session'));
				return signedIn
					? Response.json({ user: { id: 'user-a' }, session: {} })
					: readSignedOutSession();
			}
		}
	});
}

test('logout clears the auth session before the session boundary can reactivate the local owner', async () => {
	const { storage, accounts } = await createOfflineAccount();
	const refreshStarted = Promise.withResolvers<void>();
	const refresh = Promise.withResolvers<Response>();
	const auth = createLogoutAuth(() => {
		refreshStarted.resolve();
		return refresh.promise;
	});
	const session = auth.useSession();
	await session.get().refetch();
	assert.equal(session.get().data?.user.id, 'user-a');
	try {
		const logout = logoutAccount(accounts, {
			sync: syncChanges,
			signOut: () => signOutAndRefreshSession(auth)
		});
		await Promise.race([
			refreshStarted.promise,
			logout.then(() => assert.fail('Logout finished before confirming the session'))
		]);
		assert.equal(session.get().data?.user.id, 'user-a');
		assert.equal(accounts.ownerId, 'user-a');
		assert.equal((await (await accounts.get()).orm.meal.all())[0]?.name, 'Offline meal');
		refresh.resolve(Response.json(null));
		await logout;
		// The mounted session boundary selects its owner again when signingOut becomes false.
		await accounts.activate(session.get().data?.user.id);
		assert.equal(accounts.ownerId, null);
		assert.equal(storage.getItem(OWNER_STORAGE_KEY), '');
		assert.equal(
			(await indexedDB.databases()).some(({ name }) => name?.startsWith('myfit:account:')),
			false
		);
	} finally {
		await accounts.close();
	}
});

for (const outcome of ['unavailable', 'still active']) {
	test(`logout preserves local data when session confirmation is ${outcome}, and a retry succeeds`, async () => {
		const { storage, accounts } = await createOfflineAccount();
		let retry = false;
		const auth = createLogoutAuth(async () => {
			if (retry) return Response.json(null);
			return outcome === 'unavailable'
				? Response.json({ message: 'Session check unavailable' }, { status: 503 })
				: Response.json({ user: { id: 'user-a' }, session: {} });
		});
		await auth.useSession().get().refetch();
		const options = {
			sync: syncChanges,
			signOut: () => signOutAndRefreshSession(auth)
		};
		try {
			await assert.rejects(
				logoutAccount(accounts, options),
				outcome === 'unavailable' ? /Session check unavailable/ : /session is still active/
			);
			assert.equal(storage.getItem(OWNER_STORAGE_KEY), 'user-a');
			assert.equal((await (await accounts.get()).orm.meal.all())[0]?.name, 'Offline meal');
			retry = true;
			await logoutAccount(accounts, options);
			assert.equal(auth.useSession().get().data, null);
			assert.equal(await accounts.activate(), null);
		} finally {
			await accounts.close();
		}
	});
}

test('logout saves pending edits before signing out, then deletes account storage', async () => {
	const { storage, accounts, db } = await createOfflineAccount();
	const savedMeals: unknown[] = [];
	try {
		await logoutAccount(accounts, {
			sync: (db) =>
				syncChanges(db, async (events) => {
					savedMeals.push(...events.map(({ payload }) => payload));
					return events.map(({ id }) => ({ id, success: true }));
				}),
			signOut: async () => {
				assert.equal(await db.outbox.pendingCount(), 0);
				assert.equal(savedMeals.length, 1);
				assert.equal((await db.orm.meal.all())[0]?.name, 'Offline meal');
			}
		});
		assert.equal(
			(await indexedDB.databases()).some(({ name }) => name?.startsWith('myfit:account:')),
			false
		);
		await assert.rejects(accounts.get(), /No active local account/);
		const reloaded = new AccountDatabase(storage);
		assert.equal(await reloaded.activate(), null);
		try {
			const reopened = (await reloaded.activate('user-a'))!;
			assert.deepEqual(await reopened.orm.meal.all(), []);
			assert.deepEqual(await reopened.orm.user.all(), []);
			assert.equal(await reopened.outbox.pendingCount(), 0);
		} finally {
			await reloaded.close();
		}
	} finally {
		await accounts.close();
	}
});

test('failed sync keeps the session and edits available offline, and a retry can finish logout', async () => {
	const { storage, accounts, db } = await createOfflineAccount();
	let signedIn = true;
	try {
		await assert.rejects(
			logoutAccount(accounts, {
				sync: (db) =>
					syncChanges(db, async () => {
						throw new Error('Offline');
					}),
				signOut: async () => {
					signedIn = false;
				}
			}),
			/Offline/
		);
		assert.equal(signedIn, true);
		assert.equal(await db.outbox.pendingCount(), 1);
		await accounts.close();
		const reloaded = new AccountDatabase(storage);
		try {
			const offline = (await reloaded.activate())!;
			assert.equal((await offline.orm.meal.all())[0]?.name, 'Offline meal');
			assert.equal(await offline.outbox.pendingCount(), 1);
			await logoutAccount(reloaded, {
				sync: syncChanges,
				signOut: async () => {
					signedIn = false;
				}
			});
			assert.equal(signedIn, false);
		} finally {
			await reloaded.close();
		}
	} finally {
		await accounts.close();
	}
});

test('a permanent push rejection blocks logout even though the pending outbox becomes empty', async () => {
	const { accounts, db } = await createOfflineAccount();
	let signedIn = true;
	try {
		await assert.rejects(
			logoutAccount(accounts, {
				sync: (db) =>
					syncChanges(db, async (events) =>
						events.map(({ id }) => ({
							id,
							success: false,
							retryable: false,
							error: 'Not allowed',
							record: null
						}))
					),
				signOut: async () => {
					signedIn = false;
				}
			}),
			/could not be saved/
		);
		assert.equal(signedIn, true);
		assert.equal(await db.outbox.pendingCount(), 0);
		assert.equal((await (await accounts.get()).orm.user.all())[0]?.id, 'user-a');
	} finally {
		await accounts.close();
	}
});

test('explicit discard deletes unsynced edits; failed sign-out still preserves them', async () => {
	const { accounts, db } = await createOfflineAccount();
	const options = {
		discard: true,
		sync: syncChanges,
		signOut: async () => {
			throw new Error('Sign-out failed');
		}
	};
	try {
		await assert.rejects(logoutAccount(accounts, options), /Sign-out failed/);
		assert.equal(await db.outbox.pendingCount(), 1);
		assert.equal((await db.orm.meal.all())[0]?.name, 'Offline meal');
		await logoutAccount(accounts, { ...options, signOut: async () => {} });
		assert.equal(
			(await indexedDB.databases()).some(({ name }) => name?.startsWith('myfit:account:')),
			false
		);
	} finally {
		await accounts.close();
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
		await logoutAccount(accounts, { discard: true, sync: syncChanges, signOut: async () => {} });
		assert.equal(
			(await indexedDB.databases()).some(({ name }) => name === 'myfit'),
			false
		);
		assert.equal(await accounts.activate(), null);
	} finally {
		await accounts.close();
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
		await accounts.close();
	}
});
