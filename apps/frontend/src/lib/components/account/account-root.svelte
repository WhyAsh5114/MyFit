<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '#lib/clients/auth-client.js';
	import { getDb, resetDb } from '#lib/clients/idb-client.js';
	import { queryClient } from '#lib/clients/query-client.js';
	import { accountSession, publishOwner } from '#lib/features/account-session.svelte.js';
	import { createUserForCurrentSession, redirectToLogin } from '#lib/features/account-db.js';
	import { syncWorkerState } from '#lib/features/sync-worker.svelte.js';
	import { untrack } from 'svelte';
	import { ModeWatcher } from 'mode-watcher';
	import LogoutFailedDialog from './logout-failed-dialog.svelte';
	import OtherAccountDialog from './other-account-dialog.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { toast } from 'svelte-sonner';
	import StateBackdrop from '#lib/components/state-backdrop.svelte';
	import ResponsiveDialog from '#lib/components/responsive-dialog.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Toaster } from '#lib/components/ui/sonner/index.js';

	const session = authClient.useSession();
	const sessionOwner = $derived($session.data?.user.id);

	// The user the app runs as: the signed-in one, or the stored one while offline or expired.
	// `undefined` until the local database has been checked against the session.
	let ownerId = $state<string | null>();

	// The session store lags behind a login or logout, so the account is only ready once the store
	// has caught up with the database it was checked against.
	const ready = $derived(
		accountSession.tab === 'active' &&
			!$session.isPending &&
			!$session.isRefetching &&
			accountSession.logout === 'idle' &&
			ownerId !== undefined &&
			(!sessionOwner || sessionOwner === ownerId)
	);

	// Lets route loads read data only while the account they would read is the one on screen.
	$effect(() => {
		publishOwner(ready ? ownerId : undefined);
	});

	let error = $state<string | null>(null);

	// The account that owns the unsynced local data, while a different login waits for a decision.
	let otherAccountEmail = $state<string | null>(null);

	let approvedDiscardFor = $state<string>();
	let transition = Promise.resolve();

	/**
	 * Reconciles the local database with the session, then starts the sync worker.
	 *
	 * Runs on mount, when the signed-in user changes (login, logout, account switch), when the
	 * session finishes loading, when the tab becomes active or a logout ends, and when the user
	 * approves discarding another account's unsynced data. It returns early while the tab is
	 * inactive, the session is loading or a logout is running. Session data other than the user id
	 * is untracked, so token refreshes don't re-run it.
	 *
	 * Runs queue behind each other, and the cleanup cancels a superseded run before it touches state.
	 */
	$effect(() => {
		const owner = sessionOwner;
		const discardApproved = owner !== undefined && approvedDiscardFor === owner;
		if (accountSession.tab !== 'active' || $session.isPending || accountSession.logout !== 'idle')
			return;

		const sessionData = untrack(() => $session.data);
		let cancelled = false;
		ownerId = undefined;
		error = null;

		// Serialize switches so an older database open cannot overtake a newer session.
		transition = transition
			.then(async () => {
				if (cancelled) return;
				await syncWorkerState.stop();
				await queryClient.cancelQueries();
				queryClient.clear();

				let db = await getDb();
				let user = await db.orm.user.first();
				// The database only ever holds one user's data. A different login may replace it only
				// once the user agrees, unless nothing is waiting to sync.
				if (owner && user && user.id !== owner) {
					if (!discardApproved && (await db.outbox.hasPending())) {
						if (!cancelled) otherAccountEmail = user.email;
						return;
					}
					await resetDb();
					db = await getDb();
					user = null;
				}

				if (cancelled) return;
				otherAccountEmail = null;

				if (sessionData && !user) await createUserForCurrentSession(db, sessionData);
				if (cancelled) return;
				// Without a session (offline), the stored user keeps working.
				ownerId = owner ?? user?.id ?? null;
				// Only a signed-in account syncs; an expired session keeps editing locally.
				if (owner) syncWorkerState.start(db);
			})
			.catch((cause) => {
				if (cancelled) return;
				console.error('Could not prepare local account', cause);
				error = m['account.loadFailed']();
			});

		return () => {
			cancelled = true;
		};
	});

	/**
	 * Tells the user their session expired. It doesn't block the app: edits keep accumulating
	 * locally and wait for a login.
	 *
	 * Runs when `ownerId` or the session state changes. While a stored account has no session (and
	 * the session didn't fail to load, e.g. offline), it shows a persistent toast with a login
	 * action. The cleanup dismisses the toast once the session returns or the account changes.
	 */
	$effect(() => {
		const expired = ownerId && !$session.isPending && !$session.error && !$session.data;
		if (!expired) return;
		toast.info(m['account.sessionExpired'](), {
			id: 'session-expired',
			duration: Infinity,
			action: { label: m['account.logIn'](), onClick: () => void redirectToLogin(page.url) }
		});
		return () => {
			toast.dismiss('session-expired');
		};
	});
</script>

<!-- Rendered from `init`, outside the router's tree: the first navigation's loads wait for the
account, and a dialog can't live in a tree that doesn't render until they finish. -->
<ModeWatcher disableHeadScriptInjection />
<Toaster />

{#if accountSession.tab === 'blocked'}
	<StateBackdrop scene="forest" />
	<ResponsiveDialog
		title={m['account.openElsewhereTitle']()}
		description={m['account.openElsewhere']()}
		dismissible={false}
	/>
{:else if accountSession.logout === 'busy'}
	<StateBackdrop scene="sunset" />
	<ResponsiveDialog title={m['account.loggingOut']()} dismissible={false}>
		{#snippet description()}
			<span class="shimmer" role="status">{m['account.loggingOutSaving']()}</span>
		{/snippet}
	</ResponsiveDialog>
{:else if accountSession.logout === 'failed'}
	<StateBackdrop scene="gym" />
	<LogoutFailedDialog />
{:else if otherAccountEmail}
	<StateBackdrop scene="meal" />
	<OtherAccountDialog
		email={otherAccountEmail}
		ondiscard={() => (approvedDiscardFor = sessionOwner)}
	/>
{:else if error}
	<StateBackdrop scene="salad" />
	<ResponsiveDialog title={error} description={m['account.loadFailedHint']()} dismissible={false}>
		{#snippet footer()}
			<Button onclick={() => location.reload()}>{m['account.reload']()}</Button>
		{/snippet}
	</ResponsiveDialog>
{/if}
