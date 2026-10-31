<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '#lib/clients/auth-client.js';
	import { getDb, resetDb } from '#lib/clients/idb-client.js';
	import { queryClient } from '#lib/clients/query-client.js';
	import { accountSession, invalidateOwner } from '#lib/features/account-session.svelte.js';
	import { syncWorkerState } from '#lib/features/sync-worker.svelte.js';
	import { untrack, type Snippet } from 'svelte';
	import { isUnprotectedRoute } from './constants';
	import { createUserForCurrentSession, redirectToLogin } from './db';
	import LogoutFailedDialog from './logout-failed-dialog.svelte';
	import OtherAccountDialog from './other-account-dialog.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { toast } from 'svelte-sonner';
	import StateBackdrop from '#lib/components/state-backdrop.svelte';
	import ResponsiveDialog from '#lib/components/responsive-dialog.svelte';
	import { Button } from '#lib/components/ui/button/index.js';

	type Props = {
		/** The account the layout's `load` last ran for. */
		loadedOwnerId: string | null | undefined;
		children: Snippet<[string | null]>;
	};
	let { loadedOwnerId, children }: Props = $props();
	const session = authClient.useSession();
	const sessionOwner = $derived($session.data?.user.id);

	// The user the app runs as: the signed-in one, or the stored one while offline or expired.
	// `undefined` until the local database has been checked against the session.
	const ownerId = $derived(accountSession.ownerId);

	// The pages' data was read for `ownerId` once the loads have rerun after it settled, so showing
	// them any sooner would flash another account's data, or none.
	const canShowContent = $derived(
		accountSession.tab === 'active' &&
			!$session.isPending &&
			accountSession.logout === 'idle' &&
			ownerId !== undefined &&
			loadedOwnerId === ownerId &&
			(!sessionOwner || sessionOwner === ownerId) &&
			(ownerId !== null || isUnprotectedRoute(page.url.pathname))
	);
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
		accountSession.ownerId = undefined;
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
				accountSession.ownerId = owner ?? user?.id ?? null;
				// Only a signed-in account syncs; an expired session keeps editing locally.
				if (owner) syncWorkerState.start(db);
				// The pages' loads ran before there was an account to read for, or for another one.
				void invalidateOwner();
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
	 * Sends visitors with no local account and no session to the login page.
	 *
	 * Runs when `ownerId` resolves or the route changes, and does nothing on unprotected routes.
	 */
	$effect(() => {
		if (ownerId === null && !isUnprotectedRoute(page.url.pathname)) {
			void redirectToLogin(page.url);
		}
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

	/**
	 * Stops the sync worker when the component is destroyed, so it never outlives the account it
	 * serves (it is bound to this database client), and forgets the account so loads that run
	 * before the next cacher settles read nothing.
	 *
	 * Has no dependencies, so it runs once on mount; only the cleanup does anything.
	 */
	$effect(() => () => {
		accountSession.ownerId = undefined;
		void syncWorkerState.stop();
	});
</script>

{#if accountSession.logout === 'busy'}
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
{:else if canShowContent}
	{@render children(ownerId ?? null)}
{/if}
