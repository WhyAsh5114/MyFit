import { m } from '#lib/paraglide/messages.js';
import { goto } from '$app/navigation';
import { getDb, resetDb, type DbClient } from '#lib/clients/idb-client.js';
import type { Session, User } from 'better-auth';
import { toast } from 'svelte-sonner';

/** The authenticated identity cached for local and offline use. */
type AuthSessionData = {
	user: User;
	session: Session;
};

/** Sends users without a session or offline account to login without deleting any data. */
export async function redirectToLogin(url: { pathname: string; search: string; hash: string }) {
	const redirect = `${url.pathname}${url.search}${url.hash}`;
	// eslint-disable-next-line svelte/no-navigation-without-resolve
	await goto(`/login?redirect=${encodeURIComponent(redirect)}`);
	return toast.info(m['account.loginToContinue']());
}

/** Stores the signed-in user locally without queuing it for sync. */
export async function createUserForCurrentSession(db: DbClient, sessionData: AuthSessionData) {
	// The server already owns this row, so it must not be pushed back through the outbox.
	const { id, name, email, emailVerified, image, createdAt, updatedAt } = sessionData.user;
	await db.withoutTracking((orm) =>
		orm.user.create({
			id,
			name,
			email,
			emailVerified,
			image: image ?? null,
			createdAt,
			updatedAt,
			isAnonymous: null
		})
	);
}

/**
 * The email of the account whose unsynced data this device holds, when signing in as `email` would
 * replace it. `null` when the device is empty, holds the same account, or has nothing left to sync.
 */
export async function otherAccountWithUnsyncedData(email: string): Promise<string | null> {
	const db = await getDb();
	const local = await db.orm.user.first();
	if (!local || local.email.toLowerCase() === email.trim().toLowerCase()) return null;
	return (await db.outbox.hasPending()) ? local.email : null;
}

/** Deletes the local account and its data, once the user has agreed to give it up. */
export const discardLocalAccount = (): Promise<void> => resetDb();
