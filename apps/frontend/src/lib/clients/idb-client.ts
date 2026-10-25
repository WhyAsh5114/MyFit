import { createManagedAutoSyncIdbClient } from '@prisma-idb/sync-extension-idb/client';
import type { SyncIdbClient } from '@prisma-idb/sync-extension-idb/client';
import { idbSyncExtension } from '@prisma-idb/sync-extension-idb/control';
import { contractSpace, type Contract } from '@myfit/schema/client';

/** The sync-aware client selected for the active local account. */
export type DbClient = SyncIdbClient<Contract>;

export const OWNER_STORAGE_KEY = 'myfit.local-owner';
const LEGACY_OWNER_STORAGE_KEY = 'myfit.legacy-owner';

/** Creates a managed client without opening IndexedDB until its first query. */
function createDatabase(dbName: string) {
	return createManagedAutoSyncIdbClient<Contract>({
		contractSpace,
		dbName,
		extensions: [idbSyncExtension]
	});
}

/** The schema enums are available during prerendering without opening IndexedDB. */
export const enums = createDatabase('myfit').enums;

/** Keeps each account's rows, outbox and pull cursor together until explicit logout. */
export class AccountDatabase {
	ownerId: string | null = null;
	private database: ReturnType<typeof createDatabase> | undefined;

	/** Uses persistent browser storage to remember account ownership across reloads. */
	constructor(private storage: Pick<Storage, 'getItem' | 'setItem'>) {}

	/**
	 * Binds the old shared database to its sole cached user without copying or deleting data.
	 * An already mixed database cannot safely be assigned to either account.
	 */
	private async identifyLegacyOwner(): Promise<string> {
		const savedOwner = this.storage.getItem(LEGACY_OWNER_STORAGE_KEY);
		if (savedOwner !== null) return savedOwner;
		const legacy = createDatabase('myfit');
		try {
			const users = await (await legacy.get()).orm.user.all();
			if (users.length > 1) {
				throw new Error(
					'Local data belongs to multiple accounts. It has been preserved. Contact support before continuing.'
				);
			}
			const owner = users[0]?.id ?? '';
			this.storage.setItem(LEGACY_OWNER_STORAGE_KEY, owner);
			if (this.storage.getItem(OWNER_STORAGE_KEY) === null) {
				this.storage.setItem(OWNER_STORAGE_KEY, owner);
			}
			return owner;
		} finally {
			await legacy.close();
		}
	}

	/** Selects an authenticated account, or the last offline owner when no session is available. */
	async activate(authenticatedOwner?: string): Promise<DbClient | null> {
		const legacyOwner = await this.identifyLegacyOwner();
		const owner = authenticatedOwner ?? this.storage.getItem(OWNER_STORAGE_KEY);
		if (this.ownerId !== (owner || null)) {
			await this.database?.close();
			this.database = undefined;
			this.ownerId = null;
		}
		if (!owner) return null;
		this.storage.setItem(OWNER_STORAGE_KEY, owner);
		this.database ??= createDatabase(
			owner === legacyOwner ? 'myfit' : `myfit:account:${encodeURIComponent(owner)}`
		);
		this.ownerId = owner;
		return this.get();
	}

	/** Rejects queries before account selection or after another tab switches accounts. */
	async get(): Promise<DbClient> {
		if (
			!this.database ||
			!this.ownerId ||
			this.storage.getItem(OWNER_STORAGE_KEY) !== this.ownerId
		) {
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
		await this.database?.close();
		this.database = undefined;
	}

	/** Deletes the active account database after sync or an explicit discard decision. */
	async clear(): Promise<void> {
		const owner = this.ownerId;
		this.storage.setItem(OWNER_STORAGE_KEY, '');
		if (owner && this.storage.getItem(LEGACY_OWNER_STORAGE_KEY) === owner) {
			this.storage.setItem(LEGACY_OWNER_STORAGE_KEY, '');
		}
		this.ownerId = null;
		await this.database?.reset();
		this.database = undefined;
	}
}

let accounts: AccountDatabase | undefined;

/** Lazily accesses browser storage so importing enums remains safe while prerendering. */
export function getAccountDatabase(): AccountDatabase {
	return (accounts ??= new AccountDatabase(localStorage));
}

/** Returns the database selected by the session boundary. */
export const getDb = (): Promise<DbClient> => getAccountDatabase().get();
