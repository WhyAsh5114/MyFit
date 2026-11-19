<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '#lib/clients/auth-client.js';
	import { getDb, resetDb } from '#lib/clients/idb-client.js';
	import { queryClient } from '#lib/clients/query-client.js';
	import { accountSession, publishOwner } from '#lib/services/account/account-session.svelte.js';
	import {
		createUserForCurrentSession,
		redirectToLogin
	} from '#lib/services/account/account-db.js';
	import { syncWorkerState } from '#lib/services/sync/sync-worker.svelte.js';
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
	// Derived so an effect that reads them reruns only when they change. Reading `$session` itself
	// reruns it on every emission, and the store emits for each background refetch.
	const sessionOwner = $derived($session.data?.user.id);
	const sessionPending = $derived($session.isPending);

	/**
	 * Where reconciling the local database with the session stands. Each state carries only what is
	 * valid in it, and the transitions below are the only writes.
	 */
	type AccountState =
		/** The database is being checked against the session. */
		| { kind: 'preparing' }
		/** The app runs as `ownerId`: the signed-in user, or the stored one while offline or expired. */
		| { kind: 'ready'; ownerId: string | null }
		/** Another account's unsynced data is in the database; the login waits for the user's decision. */
		| { kind: 'otherAccount'; email: string }
		| { kind: 'failed'; error: string };

	let account = $state<AccountState>({ kind: 'preparing' });

	/** A new run starts. A pending other-account question stays up until the run answers it. */
	const startPreparing = () => {
		if (account.kind !== 'otherAccount') account = { kind: 'preparing' };
	};
	const becomeReady = (ownerId: string | null) => (account = { kind: 'ready', ownerId });
	const askAboutOtherAccount = (email: string) => (account = { kind: 'otherAccount', email });
	const fail = (error: string) => (account = { kind: 'failed', error });

	// `undefined` until the local database has been checked against the session.
	const ownerId = $derived.by(() => {
		if (account.kind !== 'ready') return undefined;
		return account.ownerId;
	});

	// Ready once the database was checked against the session, and the store still agrees with it.
	// A background refetch (on focus, or coming back online) doesn't count: the page stays up.
	const ready = $derived(
		accountSession.tab === 'active' &&
			!sessionPending &&
			accountSession.logout === 'idle' &&
			ownerId !== undefined &&
			(!sessionOwner || sessionOwner === ownerId)
	);

	// Lets route loads read data only while the account they would read is the one on screen.
	$effect(() => {
		publishOwner(ready ? ownerId : undefined);
	});

	// The login the user agreed may discard another account's unsynced data. An input to the run,
	// not part of `account`: it must outlive the run it starts.
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
		if (accountSession.tab !== 'active' || sessionPending || accountSession.logout !== 'idle')
			return;

		const sessionData = untrack(() => $session.data);
		let cancelled = false;
		// Untracked: the run sets `account`, which must not rerun it.
		untrack(startPreparing);

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
						if (!cancelled) askAboutOtherAccount(user.email);
						return;
					}
					await resetDb();
					db = await getDb();
					user = null;
				}

				if (cancelled) return;
				if (sessionData && !user) await createUserForCurrentSession(db, sessionData);
				if (cancelled) return;
				// Without a session (offline), the stored user keeps working.
				becomeReady(owner ?? user?.id ?? null);
				// Only a signed-in account syncs; an expired session keeps editing locally.
				if (owner) syncWorkerState.start(db);
			})
			.catch((cause) => {
				if (cancelled) return;
				console.error('Could not prepare local account', cause);
				fail(m['account.loadFailed']());
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
{:else if account.kind === 'otherAccount'}
	<StateBackdrop scene="meal" />
	<OtherAccountDialog email={account.email} ondiscard={() => (approvedDiscardFor = sessionOwner)} />
{:else if account.kind === 'failed'}
	<StateBackdrop scene="salad" />
	<ResponsiveDialog
		title={account.error}
		description={m['account.loadFailedHint']()}
		dismissible={false}
	>
		{#snippet footer()}
			<Button onclick={() => location.reload()}>{m['account.reload']()}</Button>
		{/snippet}
	</ResponsiveDialog>
{/if}
