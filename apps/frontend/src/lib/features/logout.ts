import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { authClient } from '$lib/clients/auth-client';
import { getDb, resetDb } from '$lib/clients/idb-client';
import { queryClient } from '$lib/clients/query-client';
import { accountSession } from '$lib/features/account-session.svelte';
import { syncWorkerState } from '$lib/features/sync-worker.svelte';
import posthog from 'posthog-js';

/** Confirms the session store has observed sign-out, so it cannot recreate the account being deleted. */
export async function signOutAndRefreshSession(): Promise<void> {
	// The result is ignored: a retry after a half-finished logout has no session left to end and
	// errors, so the session check below is what decides whether the sign-out worked.
	await authClient.signOut();

	// Sign-out only schedules a refetch; until it lands the store still holds the old session,
	// which would recreate the account we are about to delete.
	const session = authClient.useSession();
	await session.get().refetch();

	// Better Auth's own post-sign-out refetch can cancel the one we awaited, so wait for the
	// store to go idle rather than trusting that our request was the one that finished.
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

/**
 * Saves queued edits, signs out, then deletes the local account, and keeps the logout choices
 * visible when any step fails. Unsynced edits are only deleted once sign-out has succeeded.
 */
export async function logout(discard = false) {
	if (accountSession.logout === 'busy') return false;
	accountSession.logout = 'busy';
	try {
		const db = await getDb();
		// Retry delays are skipped so a retry from the logout dialog attempts every queued edit.
		if (!discard && (await db.outbox.hasPending())) {
			await syncWorkerState.syncWorker?.forceSync({ overrideBackoff: true });
		}
		await syncWorkerState.stop();
		await queryClient.cancelQueries();

		if (!discard && (await db.outbox.hasPending()))
			throw new Error('Some changes have not synced yet.');

		await signOutAndRefreshSession();
		await resetDb();
		queryClient.clear();
		await goto(resolve('login'));
		accountSession.logout = 'idle';
		posthog.capture('user_logged_out');
		posthog.reset();
		return true;
	} catch (error) {
		console.error('Could not log out', error);
		accountSession.logout = 'failed';
		return false;
	}
}

/** Returns to the account without deleting pending edits after a failed logout. */
export function cancelLogout() {
	accountSession.logout = 'idle';
}
