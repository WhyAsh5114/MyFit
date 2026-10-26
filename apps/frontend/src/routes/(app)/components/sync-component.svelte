<script lang="ts">
	import {
		AlertCircleIcon,
		CloudAlertIcon,
		CloudOffIcon,
		CloudCheckIcon,
		CloudSyncIcon,
		ClockIcon,
		RefreshCcwIcon
	} from '@lucide/svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { syncWorkerState } from '$lib/features/sync-worker.svelte';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { m } from '$lib/paraglide/messages';
	import { getDb, type DbClient } from '$lib/clients/idb-client';
	import { page } from '$app/state';
	import { authClient } from '$lib/clients/auth-client';
	import { onMount } from 'svelte';
	import { online } from 'svelte/reactivity/window';
	import { redirectToLogin } from './db';
	import type { SyncWorkerStatus } from '@prisma-idb/sync-extension-idb/client';

	let hasAnyRetryableUnsynced = $state<boolean>();

	/** Refreshes the indicator whenever the outbox gains, loses or fails an event. */
	async function updateOutboxStats(db: DbClient) {
		hasAnyRetryableUnsynced = await db.outbox.hasPending();
	}

	onMount(() => {
		const unsubscribe = getDb().then((db) => {
			void updateOutboxStats(db);
			return db.on('outboxchange', () => updateOutboxStats(db));
		});
		return () => void unsubscribe.then((off) => off());
	});

	const STATUS_LABELS: Record<SyncWorkerStatus, () => string> = {
		idle: m['sync.statusIdle'],
		pulling: m['sync.statusPulling'],
		pushing: m['sync.statusPushing'],
		error: m['sync.statusError'],
		stopped: m['sync.statusStopped']
	};

	let syncStatus = $derived(syncWorkerState.syncStatus);
	let lastSyncTime = $derived(syncWorkerState.lastSyncTime);
	let lastError = $derived(syncWorkerState.lastError);

	const session = authClient.useSession();

	/**
	 * Why changes aren't syncing, when that isn't an error: the browser is offline, or no worker is
	 * running because the session expired (`signedOut`) or couldn't be checked. Edits keep saving
	 * locally either way. `null` while syncing normally or still starting.
	 */
	let paused = $derived.by(() => {
		if (!online.current) return 'offline' as const;
		if (syncStatus !== undefined || $session.isPending) return null;
		if ($session.error) return 'offline' as const;
		return $session.data ? null : ('signedOut' as const);
	});

	let statusLabel = $derived(
		syncStatus === undefined ? m['sync.statusConnecting']() : STATUS_LABELS[syncStatus]()
	);

	let statusVariant = $derived.by(() => {
		if (syncStatus === 'idle' || syncStatus === 'pulling') return 'secondary' as const;
		if (syncStatus === 'pushing') return 'default' as const;
		if ((syncStatus === 'stopped' || syncStatus === 'error') && lastError)
			return 'destructive' as const;
		return 'outline' as const;
	});

	let lastSyncDisplay = $derived(
		lastSyncTime
			? lastSyncTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
			: m['sync.neverSynced']()
	);
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				variant="ghost"
				{...props}
				aria-label={m['sync.title']()}
				class="h-3 w-3 p-0 pr-2 text-muted-foreground"
			>
				{#if paused}
					<CloudOffIcon class="size-5" strokeWidth={1.5} />
				{:else if syncStatus === undefined}
					<Spinner class="size-5" strokeWidth={1.5} />
				{:else if syncStatus === 'idle' || syncStatus === 'pulling'}
					<CloudCheckIcon class="size-5" strokeWidth={1.5} />
				{:else if syncStatus === 'pushing'}
					<CloudSyncIcon class="size-5 animate-pulse" strokeWidth={1.5} />
				{:else if syncStatus === 'stopped' || syncStatus === 'error'}
					<CloudAlertIcon class="size-5" strokeWidth={1.5} />
				{/if}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content align="end" class="flex w-56 flex-col gap-2 p-3">
		<div class="flex items-center justify-between gap-3">
			<p class="text-sm font-medium">{m['sync.title']()}</p>
			{#if !paused}
				<Badge variant={statusVariant}>{statusLabel}</Badge>
			{/if}
		</div>
		<Separator />
		{#if paused}
			<div
				class="flex items-start gap-2 rounded-md bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400"
			>
				<CloudOffIcon class="mt-0.5 size-3.5 shrink-0" />
				<span
					>{paused === 'signedOut' ? m['sync.pausedSignedOut']() : m['sync.pausedOffline']()}</span
				>
			</div>
			{#if paused === 'signedOut'}
				<Button
					size="sm"
					class="w-full"
					variant="secondary"
					onclick={() => void redirectToLogin(page.url)}
				>
					{m['account.logIn']()}
				</Button>
			{/if}
		{/if}
		{#if !paused || lastSyncTime}
			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				<ClockIcon class="size-3.5 shrink-0" />
				<span>{m['sync.lastSynced']()}</span>
				<span class="ml-auto font-medium tabular-nums">{lastSyncDisplay}</span>
			</div>
		{/if}
		{#if lastError && !paused}
			<div class="flex items-start gap-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
				<AlertCircleIcon class="mt-0.5 size-3.5 shrink-0" />
				<span class="break-all">{lastError}</span>
			</div>
		{/if}
		{#if !paused && hasAnyRetryableUnsynced && syncWorkerState.syncWorker && (syncStatus === 'idle' || syncStatus === 'error')}
			<Button
				size="sm"
				class="w-full"
				variant="secondary"
				onclick={() =>
					// The worker's `error` event already reports the failure to `lastError`.
					syncWorkerState.syncWorker?.forceSync().catch(() => {})}
			>
				{m['sync.syncNow']()}
				<RefreshCcwIcon />
			</Button>
		{/if}
	</Popover.Content>
</Popover.Root>
