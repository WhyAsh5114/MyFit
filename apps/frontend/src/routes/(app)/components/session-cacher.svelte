<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Dialog } from 'bits-ui';
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
	const canShowContent = $derived(
		!$session.isPending &&
			!accountSession.signingOut &&
			accountSession.ready &&
			(!sessionOwner || sessionOwner === accountSession.ownerId) &&
			(accountSession.ownerId !== null || isUnprotectedRoute(page.url.pathname))
	);
	let error = $state<string | null>(null);
	let conflict = $state(false);
	let conflictBusy = $state(false);
	let accountChanged = $state(false);
	let transition = Promise.resolve();

	$effect(() => {
		const owner = sessionOwner;
		if (
			$session.isPending ||
			accountSession.signingOut ||
			accountChanged ||
			untrack(() => conflictBusy)
		)
			return;
		const sessionData = untrack(() => $session.data);
		let cancelled = false;
		accountSession.ready = false;
		error = null;
		conflict = false;

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
			.catch((cause) => {
				if (!cancelled) {
					conflict = cause instanceof LocalAccountConflict;
					error = cause instanceof Error ? cause.message : 'Failed to open local account';
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

	/** Keeps the previous data for reauthentication, or deletes it before admitting the new user. */
	async function resolveConflict(discard: boolean) {
		if (conflictBusy) return;
		conflictBusy = true;
		try {
			if (discard) {
				await getAccountDatabase().clear();
				window.location.reload();
			} else {
				await signOutAndRefreshSession(authClient);
				window.location.assign(resolve('/login'));
			}
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Could not change accounts';
		} finally {
			conflictBusy = false;
		}
	}

	onMount(() => {
		/** Hides stale views immediately when another tab logs out or selects another account. */
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
	<section class="mx-auto flex max-w-md flex-col gap-4 p-6">
		<p role="alert">{m['account.changedInAnotherTab']()}</p>
		<Button onclick={() => window.location.reload()}>{m['account.reload']()}</Button>
	</section>
{:else if accountSession.signingOut}
	{#if accountSession.logoutError}
		<Dialog.Root
			open={true}
			onOpenChange={(open) => {
				if (!open) cancelLogout();
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content
					class="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg border bg-background p-6 shadow-lg"
				>
					<Dialog.Title class="text-lg font-semibold">{m['account.logoutFailed']()}</Dialog.Title>
					<Dialog.Description>{m['account.logoutUnsynced']()}</Dialog.Description>
					<p role="alert" class="text-sm text-muted-foreground">{accountSession.logoutError}</p>
					<div class="flex flex-wrap gap-2">
						<Button variant="outline" onclick={cancelLogout}>{m['account.logoutCancel']()}</Button>
						<Button onclick={() => retryLogout()}>{m['account.logoutRetry']()}</Button>
						<Button variant="destructive" onclick={() => retryLogout(true)}
							>{m['account.logoutDiscard']()}</Button
						>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	{:else}
		<p role="status" class="p-6">{m['account.loggingOut']()}</p>
	{/if}
{:else if conflict}
	<Dialog.Root open={true}>
		<Dialog.Portal>
			<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50" />
			<Dialog.Content
				escapeKeydownBehavior="ignore"
				interactOutsideBehavior="ignore"
				class="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg border bg-background p-6 shadow-lg"
				aria-busy={conflictBusy}
			>
				<Dialog.Title class="text-lg font-semibold">{m['account.previousDataTitle']()}</Dialog.Title
				>
				<Dialog.Description>{m['account.previousDataDescription']()}</Dialog.Description>
				<p role="alert" class="text-sm text-muted-foreground">{error}</p>
				<div class="flex flex-wrap gap-2">
					<Button disabled={conflictBusy} variant="outline" onclick={() => resolveConflict(false)}
						>{m['account.previousDataKeep']()}</Button
					>
					<Button
						disabled={conflictBusy}
						variant="destructive"
						onclick={() => resolveConflict(true)}>{m['account.previousDataDiscard']()}</Button
					>
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
{:else if error}
	<p role="alert" class="p-4">{error}</p>
{:else if canShowContent}
	{#key accountSession.ownerId}
		{@render children()}
	{/key}
{/if}
