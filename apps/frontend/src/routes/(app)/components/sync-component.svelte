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
	import * as Drawer from '#lib/components/ui/drawer/index.js';
	import Badge from '#lib/components/ui/badge/badge.svelte';
	import Button from '#lib/components/ui/button/button.svelte';
	import { syncWorkerState } from '#lib/services/sync/sync-worker.svelte.js';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getDb, type DbClient } from '#lib/clients/idb-client.js';
	import { page } from '$app/state';
	import { authClient } from '#lib/clients/auth-client.js';
	import { onMount } from 'svelte';
	import { online } from 'svelte/reactivity/window';
	import { redirectToLogin } from '#lib/services/account/account-db.js';
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

<Drawer.Root>
	<Drawer.Trigger>
		{#snippet child({ props })}
			<Button
				variant="ghost"
				size="icon"
				{...props}
				aria-label={m['sync.title']()}
				class="text-muted-foreground"
			>
				{#if paused}
					<CloudOffIcon class="size-5" strokeWidth={1.5} />
				{:else if syncStatus === undefined}
					<Spinner class="size-5 stroke-[1.5]" />
				{:else if syncStatus === 'idle' || syncStatus === 'pulling'}
					<CloudCheckIcon class="size-5" strokeWidth={1.5} />
				{:else if syncStatus === 'pushing'}
					<CloudSyncIcon class="size-5 animate-pulse" strokeWidth={1.5} />
				{:else if syncStatus === 'stopped' || syncStatus === 'error'}
					<CloudAlertIcon class="size-5" strokeWidth={1.5} />
				{/if}
			</Button>
		{/snippet}
	</Drawer.Trigger>
	<Drawer.Content>
		<Drawer.Header class="text-start">
			<div class="flex items-center justify-between gap-3">
				<Drawer.Title>{m['sync.title']()}</Drawer.Title>
				{#if !paused}
					<Badge variant={statusVariant}>{statusLabel}</Badge>
				{/if}
			</div>
			<!-- While paused there is no status to read out, and "Connecting" would be wrong. -->
			<Drawer.Description class="sr-only">
				{paused ? m['sync.title']() : statusLabel}
			</Drawer.Description>
		</Drawer.Header>
		<div class="flex flex-col gap-3 px-4 pb-2">
			{#if paused}
				<div class="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
					<CloudOffIcon class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
					<span>
						{paused === 'signedOut' ? m['sync.pausedSignedOut']() : m['sync.pausedOffline']()}
					</span>
				</div>
				{#if paused === 'signedOut'}
					<Button variant="secondary" onclick={() => void redirectToLogin(page.url)}>
						{m['account.logIn']()}
					</Button>
				{/if}
			{/if}
			{#if !paused || lastSyncTime}
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<ClockIcon class="size-4 shrink-0" />
					<span>{m['sync.lastSynced']()}</span>
					<span class="ml-auto font-medium text-foreground tabular-nums">{lastSyncDisplay}</span>
				</div>
			{/if}
			{#if lastError && !paused}
				<div
					class="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
				>
					<AlertCircleIcon class="mt-0.5 size-4 shrink-0" />
					<span class="break-all">{lastError}</span>
				</div>
			{/if}
			{#if !paused && hasAnyRetryableUnsynced && syncWorkerState.syncWorker && (syncStatus === 'idle' || syncStatus === 'error')}
				<Button
					variant="secondary"
					onclick={() =>
						// The worker's `error` event already reports the failure to `lastError`.
						syncWorkerState.syncWorker?.forceSync().catch(() => {})}
				>
					{m['sync.syncNow']()}
					<RefreshCcwIcon />
				</Button>
			{/if}
		</div>
		<Drawer.Footer>
			<Drawer.Close>
				{#snippet child({ props })}
					<Button variant="outline" {...props}>{m['common.close']()}</Button>
				{/snippet}
			</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
