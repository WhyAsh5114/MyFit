<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/clients/auth-client';
	import { getAccountDatabase, OWNER_STORAGE_KEY } from '$lib/clients/idb-client';
	import { queryClient } from '$lib/clients/query-client';
	import { accountSession } from '$lib/features/account-session.svelte';
	import { syncWorkerState } from '$lib/features/sync-worker.svelte';
	import { onMount, untrack, type Snippet } from 'svelte';
	import { isUnprotectedRoute } from './constants';
	import { createUserForCurrentSession, redirectToLogin } from './db';

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
	let transition = Promise.resolve();

	$effect(() => {
		const owner = sessionOwner;
		if ($session.isPending || accountSession.signingOut) return;
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
			.catch((cause) => {
				if (!cancelled)
					error = cause instanceof Error ? cause.message : 'Failed to open local account';
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

	onMount(() => {
		/** Hides stale views immediately when another tab logs out or selects another account. */
		function onAccountChange(event: StorageEvent) {
			if (event.key !== OWNER_STORAGE_KEY && event.key !== null) return;
			accountSession.ready = false;
			void syncWorkerState.stop();
			queryClient.clear();
			window.location.reload();
		}
		window.addEventListener('storage', onAccountChange);
		return () => window.removeEventListener('storage', onAccountChange);
	});
</script>

{#if error}
	<p role="alert" class="p-4">{error}</p>
{:else if canShowContent}
	{#key accountSession.ownerId}
		{@render children()}
	{/key}
{/if}
