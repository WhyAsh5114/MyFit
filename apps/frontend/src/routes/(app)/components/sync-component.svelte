<script lang="ts">
	import {
		AlertCircleIcon,
		CloudAlertIcon,
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
	import { getDb } from '$lib/clients/idb-client';
	import { onMount } from 'svelte';
	import { authClient } from '$lib/clients/auth-client';
	import { accountSession } from '$lib/features/account-session.svelte';

	const session = authClient.useSession();
	$effect(() => {
		if ($session.data?.user.id === accountSession.ownerId && accountSession.ready) {
			syncWorkerState.start();
		} else {
			void syncWorkerState.stop();
		}
	});

	let hasAnyRetryableUnsynced = $state<boolean>();

	/** Refreshes the indicator whenever the outbox gains, loses or fails an event. */
	async function updateOutboxStats() {
		const db = await getDb();
		hasAnyRetryableUnsynced = await db.outbox.hasPending();
	}

	onMount(() => {
		updateOutboxStats();
		let unsubscribe: (() => void) | undefined;
		let destroyed = false;
		getDb().then((db) => {
			if (destroyed) return;
			unsubscribe = db.on('outboxchange', updateOutboxStats);
		});

		return () => {
			destroyed = true;
			unsubscribe?.();
			void syncWorkerState.stop();
		};
	});

	let syncStatus = $derived(syncWorkerState.syncStatus);
	let lastSyncTime = $derived(syncWorkerState.lastSyncTime);
	let lastError = $derived(syncWorkerState.lastError);

	let statusLabel = $derived(
		syncStatus === undefined
			? m['sync.statusConnecting']()
			: syncStatus === 'idle'
				? m['sync.statusIdle']()
				: syncStatus === 'pulling'
					? m['sync.statusPulling']()
					: syncStatus === 'pushing'
						? m['sync.statusPushing']()
						: syncStatus === 'error'
							? m['sync.statusError']()
							: m['sync.statusStopped']()
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
			<Button variant="ghost" {...props} class="h-3 w-3 p-0 pr-2 text-muted-foreground">
				{#if syncStatus === undefined}
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
			<Badge variant={statusVariant}>{statusLabel}</Badge>
		</div>
		<Separator />
		<div class="flex items-center gap-2 text-xs text-muted-foreground">
			<ClockIcon class="size-3.5 shrink-0" />
			<span>{m['sync.lastSynced']()}</span>
			<span class="ml-auto font-medium tabular-nums">{lastSyncDisplay}</span>
		</div>
		{#if lastError}
			<div class="flex items-start gap-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
				<AlertCircleIcon class="mt-0.5 size-3.5 shrink-0" />
				<span class="break-all">{lastError}</span>
			</div>
		{/if}
		{#if hasAnyRetryableUnsynced && syncWorkerState.syncWorker && (syncStatus === 'idle' || syncStatus === 'error')}
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
