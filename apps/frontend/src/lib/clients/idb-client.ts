import { createManagedAutoSyncIdbClient } from '@prisma-idb/sync-extension-idb/client';
import type { SyncIdbClient } from '@prisma-idb/sync-extension-idb/client';
import { idbSyncExtension } from '@prisma-idb/sync-extension-idb/control';
import { contractSpace, type Contract } from '@myfit/schema/client';

/** The sync-aware client for the single local database. */
export type DbClient = SyncIdbClient<Contract>;

export const OWNER_STORAGE_KEY = 'myfit.local-owner';

/** Creates a managed client without opening IndexedDB until its first query. */
function createDatabase() {
	return createManagedAutoSyncIdbClient<Contract>({
		contractSpace,
		dbName: 'myfit',
		extensions: [idbSyncExtension]
	});
}

/** The schema enums are available during prerendering without opening IndexedDB. */
export const enums = createDatabase().enums;

/** Blocks an unexpected session from accessing the previous user's data. */
export class LocalAccountConflict extends Error {
	constructor() {
		super('The authenticated session does not own the local database.');
	}
}

/** Keeps one user's rows, outbox and pull cursor in the app's only database. */
export class AccountDatabase {
	ownerId: string | null = null;
	private database = createDatabase();

	/** Uses persistent browser storage to remember account ownership across reloads. */
	constructor(private storage: Pick<Storage, 'getItem' | 'setItem'>) {}

	/** Selects an authenticated account, or the last offline owner when no session is available. */
	async activate(authenticatedOwner?: string): Promise<DbClient | null> {
		const savedOwner = this.storage.getItem(OWNER_STORAGE_KEY);
		if (!authenticatedOwner && savedOwner === '') return null;
		const users = await (await this.database.get()).orm.user.all();
		// Another tab can log out while this open is pending. Never restore its revoked owner.
		if (this.storage.getItem(OWNER_STORAGE_KEY) !== savedOwner) {
			await this.close();
			throw new LocalAccountConflict();
		}
		// Inspect the existing shared database too; metadata alone cannot authorize replacing it.
		const existingOwner = users[0]?.id || savedOwner;
		if (
			users.length > 1 ||
			(authenticatedOwner && existingOwner && authenticatedOwner !== existingOwner)
		) {
			await this.close();
			throw new LocalAccountConflict();
		}
		const owner = authenticatedOwner ?? existingOwner;
		if (!owner) return null;
		this.storage.setItem(OWNER_STORAGE_KEY, owner);
		this.ownerId = owner;
		return this.get();
	}

	/** Rejects queries before account selection or after another tab switches accounts. */
	async get(): Promise<DbClient> {
		if (!this.ownerId || this.storage.getItem(OWNER_STORAGE_KEY) !== this.ownerId) {
			throw new Error('No active local account');
		}
		const owner = this.ownerId;
		const db = await this.database.get();
		if (this.ownerId !== owner || this.storage.getItem(OWNER_STORAGE_KEY) !== owner) {
			throw new Error('The local account changed while opening the database');
		}
		return db;
	}

	/** Closes the connection without deleting offline edits or changing the remembered account. */
	async close(): Promise<void> {
		this.ownerId = null;
		await this.database.close();
	}

	/** Deletes all local rows and sync state after sync or an explicit discard decision. */
	async clear(): Promise<void> {
		// Revoke access in other tabs before reset waits for their connections to close.
		this.storage.setItem(OWNER_STORAGE_KEY, '');
		this.ownerId = null;
		await this.database.reset();
	}
}

let accounts: AccountDatabase | undefined;

/** Lazily accesses browser storage so importing enums remains safe while prerendering. */
export function getAccountDatabase(): AccountDatabase {
	return (accounts ??= new AccountDatabase(localStorage));
}

/** Returns the database selected by the session boundary. */
export const getDb = (): Promise<DbClient> => getAccountDatabase().get();
