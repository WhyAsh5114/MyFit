import { goto } from '$app/navigation';
import { getAccountDatabase, type DbClient } from '$lib/clients/idb-client';
import { syncWorkerState } from '$lib/features/sync-worker.svelte';
import type { Session, User } from 'better-auth';
import { queryClient } from '$lib/clients/query-client';
import { accountSession } from '$lib/features/account-session.svelte';
import { authClient } from '$lib/clients/auth-client';
import { resolve } from '$app/paths';
import { toast } from 'svelte-sonner';
import { logoutAccount, signOutAndRefreshSession } from '$lib/features/logout';

/** The authenticated identity cached for local and offline use. */
type AuthSessionData = {
	user: User;
	session: Session;
};

/** Syncs edits before sign-out and keeps the logout choices visible when any step fails. */
export async function logout(discard = false) {
	if (accountSession.logoutBusy) return false;
	accountSession.signingOut = true;
	accountSession.logoutBusy = true;
	accountSession.ready = false;
	try {
		await syncWorkerState.stop();
		await queryClient.cancelQueries();
		await logoutAccount(getAccountDatabase(), {
			discard,
			sync: (db) => syncWorkerState.flushForLogout(db),
			signOut: () => signOutAndRefreshSession(authClient)
		});
		accountSession.ownerId = null;
		queryClient.clear();
		await goto(resolve('/login'));
		accountSession.logoutError = null;
		accountSession.signingOut = false;
		return true;
	} catch (error) {
		console.error('Could not log out', error);
		accountSession.logoutError = error instanceof Error ? error.message : 'Could not sign out.';
		return false;
	} finally {
		accountSession.logoutBusy = false;
	}
}

/** Returns to the account without deleting pending edits after a failed logout. */
export function cancelLogout() {
	accountSession.logoutError = null;
	accountSession.signingOut = false;
}

/** Sends users without a session or offline account to login without deleting any data. */
export async function redirectToLogin(url: URL) {
	const redirect = `${url.pathname}${url.search}${url.hash}`;
	// eslint-disable-next-line svelte/no-navigation-without-resolve
	await goto(`/login?redirect=${encodeURIComponent(redirect)}`);
	return toast.info('Please login to continue');
}

const DEFAULT_MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

/** Caches the server identity without tracking it, then seeds meals for new accounts. */
export async function createUserForCurrentSession(db: DbClient, sessionData: AuthSessionData) {
	if (sessionData?.user) {
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

		// Seed default meals for brand new users (existing users have a name set)
		if (sessionData.user.name.trim() === '') {
			await Promise.all(
				DEFAULT_MEALS.map((name, index) =>
					db.orm.meal.create({ name, sortOrder: index, userId: sessionData.user.id })
				)
			);
		}
	}
}
