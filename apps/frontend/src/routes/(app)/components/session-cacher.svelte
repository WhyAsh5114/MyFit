<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import { signOutAndRefreshSession } from '$lib/features/logout';
	import { authClient } from '$lib/clients/auth-client';
	import {
		getAccountDatabase,
		LocalAccountConflict,
		OWNER_STORAGE_KEY
	} from '$lib/clients/idb-client';
	import { queryClient } from '$lib/clients/query-client';
	import { accountSession } from '$lib/features/account-session.svelte';
	import { syncWorkerState } from '$lib/features/sync-worker.svelte';
	import { onMount, untrack, type Snippet } from 'svelte';
	import { isUnprotectedRoute } from './constants';
	import { cancelLogout, createUserForCurrentSession, logout, redirectToLogin } from './db';
	import { Button } from '$lib/components/ui/button';
	import { m } from '$lib/paraglide/messages';
	import posthog from 'posthog-js';

	let { children }: { children: Snippet } = $props();
	const session = authClient.useSession();
	const sessionOwner = $derived($session.data?.user.id);
	let recovering = $state(false);
	const canShowContent = $derived(
		!$session.isPending &&
			!accountSession.signingOut &&
			!recovering &&
			accountSession.ready &&
			(!sessionOwner || sessionOwner === accountSession.ownerId) &&
			(accountSession.ownerId !== null || isUnprotectedRoute(page.url.pathname))
	);
	let error = $state<string | null>(null);
	let recoveryFailed = $state(false);
	let accountChanged = $state(false);
	let transition = Promise.resolve();

	$effect(() => {
		const owner = sessionOwner;
		if (
			$session.isPending ||
			accountSession.signingOut ||
			accountChanged ||
			untrack(() => recovering)
		)
			return;
		const sessionData = untrack(() => $session.data);
		let cancelled = false;
		accountSession.ready = false;
		error = null;

		// Serialize switches so an older database open cannot overtake a newer session.
		transition = transition
			.then(async () => {
				if (cancelled) return;
				await syncWorkerState.stop();
				await queryClient.cancelQueries();
				queryClient.clear();
				const accounts = getAccountDatabase();
				const db = await accounts.activate(owner);
				if (cancelled) return;
				if (db && sessionData && !(await db.orm.user.where({ id: owner }).first())) {
					await createUserForCurrentSession(db, sessionData);
				}
				if (cancelled) return;
				accountSession.ownerId = accounts.ownerId;
				accountSession.ready = true;
			})
			.catch(async (cause) => {
				if (cancelled) return;
				console.error('Could not prepare local account', cause);
				if (cause instanceof LocalAccountConflict) {
					await returnToSignIn();
				} else {
					error = m['account.logoutFailed']();
				}
			});

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (accountSession.ready && !accountSession.ownerId && !isUnprotectedRoute(page.url.pathname)) {
			void redirectToLogin(page.url);
		}
	});

	/** Resets analytics when a retry or an explicit discard finishes logout. */
	async function retryLogout(discard = false) {
		if (await logout(discard)) {
			posthog.capture('user_logged_out');
			posthog.reset();
		}
	}

	/** Returns an unexpected session to sign-in without deleting the previous user's edits. */
	async function returnToSignIn() {
		recovering = true;
		recoveryFailed = false;
		try {
			await signOutAndRefreshSession(authClient);
			window.location.assign(resolve('/login'));
		} catch (cause) {
			console.error('Could not return to sign-in', cause);
			recoveryFailed = true;
		}
	}

	onMount(() => {
		/** Hides stale views immediately when another tab logs out or signs in. */
		async function onAccountChange(event: StorageEvent) {
			if (event.key !== OWNER_STORAGE_KEY && event.key !== null) return;
			accountChanged = true;
			accountSession.ready = false;
			await syncWorkerState.stop();
			await queryClient.cancelQueries();
			queryClient.clear();
			await getAccountDatabase().close();
			// Reopening here could block the other tab's deletion of the shared database.
		}
		window.addEventListener('storage', onAccountChange);
		return () => window.removeEventListener('storage', onAccountChange);
	});
</script>

{#if accountChanged}
	<ResponsiveDialog
		open={true}
		title={m['account.reloadTitle']()}
		description={m['account.changedInAnotherTab']()}
		dismissible={false}
	>
		<div class="flex justify-end">
			<Button onclick={() => window.location.reload()}>{m['account.reload']()}</Button>
		</div>
	</ResponsiveDialog>
{:else if accountSession.signingOut}
	{#if accountSession.logoutError}
		<ResponsiveDialog
			open={true}
			title={m['account.logoutFailed']()}
			description={m['account.logoutUnsynced']()}
			closeLabel={m['account.logoutCancel']()}
			busy={accountSession.logoutBusy}
			onclose={cancelLogout}
		>
			<div class="flex justify-between gap-2">
				<Button
					disabled={accountSession.logoutBusy}
					class="h-auto min-h-9 min-w-0 shrink whitespace-normal"
					variant="destructive"
					onclick={() => retryLogout(true)}>{m['account.logoutDiscard']()}</Button
				>
				<Button
					disabled={accountSession.logoutBusy}
					class="h-auto min-h-9 min-w-0 shrink whitespace-normal"
					variant="outline"
					onclick={() => retryLogout()}>{m['account.logoutRetry']()}</Button
				>
			</div>
		</ResponsiveDialog>
	{:else}
		<p role="status" class="p-6">{m['account.loggingOut']()}</p>
	{/if}
{:else if recoveryFailed}
	<div class="flex flex-col gap-4 p-6">
		<p role="alert">{m['account.logoutFailed']()}</p>
		<Button variant="outline" onclick={returnToSignIn}>{m['account.logoutRetry']()}</Button>
	</div>
{:else if error}
	<p role="alert" class="p-4">{error}</p>
{:else if canShowContent}
	{#key accountSession.ownerId}
		{@render children()}
	{/key}
{/if}
