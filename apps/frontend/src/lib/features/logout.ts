import type { SyncWorker } from '@prisma-idb/sync-extension-idb/client';
import type { createAuthClient } from 'better-auth/svelte';
import type { AccountDatabase, DbClient } from '../clients/idb-client';

/** Confirms the session boundary has observed sign-out before local account deletion. */
export async function signOutAndRefreshSession(
	auth: Pick<ReturnType<typeof createAuthClient>, 'signOut' | 'useSession'>
): Promise<void> {
	const { error } = await auth.signOut();
	if (error) throw new Error(error.message ?? 'Could not sign out');
	// Sign-out only schedules a refetch; its cached session can otherwise recreate the account.
	const session = auth.useSession();
	await session.get().refetch({ query: { disableCookieCache: true } });
	// A sign-out notification can start a newer refetch and supersede the one we awaited.
	const settled = Promise.withResolvers<void>();
	const unsubscribe = session.subscribe((current) => {
		if (!current.isPending && !current.isRefetching) settled.resolve();
	});
	try {
		await settled.promise;
	} finally {
		unsubscribe();
	}
	const current = session.get();
	if (current.error) throw new Error(current.error.message ?? 'Could not confirm sign-out');
	if (current.data) throw new Error('The session is still active. Please retry logging out.');
}

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
