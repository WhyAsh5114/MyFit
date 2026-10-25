import type { SyncWorker } from '@prisma-idb/sync-extension-idb/client';
import type { AccountDatabase, DbClient } from '../clients/idb-client';

/** Supplies the existing sync transport and authenticated sign-out to the logout boundary. */
type LogoutOptions = {
	sync: (db: DbClient) => Promise<void>;
	signOut: () => Promise<void>;
	discard?: boolean;
};

/** Flushes queued edits before sign-out, then deletes local data only after sign-out succeeds. */
export async function logoutAccount(
	accounts: AccountDatabase,
	options: LogoutOptions
): Promise<void> {
	if (!options.discard && accounts.ownerId !== null) {
		const db = await accounts.get();
		if (await db.outbox.hasPending()) {
			await options.sync(db);
			if (await db.outbox.hasPending()) throw new Error('Some changes have not synced yet.');
		}
	}
	await options.signOut();
	await accounts.clear();
}

/** Runs one bounded sync cycle and refuses logout if the server rejects any queued edits. */
export async function flushLogoutChanges(worker: SyncWorker): Promise<void> {
	let rejected = false;
	const unsubscribe = worker.on('pushcompleted', ({ failed }) => {
		rejected ||= failed > 0;
	});
	try {
		await worker.forceSync();
		if (rejected) throw new Error('Some changes could not be saved to the server.');
	} finally {
		unsubscribe();
		await worker.stop();
	}
}
