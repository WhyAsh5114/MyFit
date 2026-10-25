import { goto } from '$app/navigation';
import { getAccountDatabase, type DbClient } from '$lib/clients/idb-client';
import { syncWorkerState } from '$lib/features/sync-worker.svelte';
import type { Session, User } from 'better-auth';
import { queryClient } from '$lib/clients/query-client';
import { accountSession } from '$lib/features/account-session.svelte';
import { authClient } from '$lib/clients/auth-client';
import { resolve } from '$app/paths';
import { toast } from 'svelte-sonner';

/** The authenticated identity cached for local and offline use. */
type AuthSessionData = {
	user: User;
	session: Session;
};

/** Stops sync before signing out; failed sign-out keeps the account and all local edits available. */
export async function logout() {
	accountSession.signingOut = true;
	accountSession.ready = false;
	try {
		await syncWorkerState.stop();
		await queryClient.cancelQueries();
		const { error } = await authClient.signOut();
		if (error) throw new Error(error.message ?? 'Could not sign out');
		await getAccountDatabase().deactivate();
		accountSession.ownerId = null;
		queryClient.clear();
		await goto(resolve('/login'));
		return true;
	} catch (error) {
		accountSession.ready = getAccountDatabase().ownerId !== null;
		toast.error(
			error instanceof Error ? error.message : 'Could not sign out. Your local edits are safe.'
		);
		return false;
	} finally {
		accountSession.signingOut = false;
	}
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
