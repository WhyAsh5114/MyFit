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
	import { getClient } from '$lib/clients/idb-client';
	import { onMount } from 'svelte';

	let hasAnyRetryableUnsynced = $state<boolean>();

	async function updateOutboxStats() {
		hasAnyRetryableUnsynced = await getClient().$outbox.hasAnyRetryableUnsynced();
	}

	onMount(() => {
		updateOutboxStats();
		const unsubscribe = getClient().$outbox.subscribe(
			['create', 'update', 'delete'],
			updateOutboxStats
		);

		return () => {
			unsubscribe();
		};
	});

	let syncStatus = $derived(syncWorkerState.syncStatus?.status);
	let lastSyncTime = $derived(syncWorkerState.syncStatus?.lastSyncTime ?? null);
	let lastError = $derived(syncWorkerState.syncStatus?.lastError?.message ?? null);

	let statusLabel = $derived(
		syncStatus === undefined
			? m['sync.statusConnecting']()
			: syncStatus === 'IDLE'
				? m['sync.statusIdle']()
				: syncStatus === 'PULLING'
					? m['sync.statusPulling']()
					: syncStatus === 'PUSHING'
						? m['sync.statusPushing']()
						: m['sync.statusStopped']()
	);

	let statusVariant = $derived.by(() => {
		if (syncStatus === 'IDLE' || syncStatus === 'PULLING') return 'secondary' as const;
		if (syncStatus === 'PUSHING') return 'default' as const;
		if (syncStatus === 'STOPPED' && lastError) return 'destructive' as const;
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
				{:else if syncStatus === 'IDLE' || syncStatus === 'PULLING'}
					<CloudCheckIcon class="size-5" strokeWidth={1.5} />
				{:else if syncStatus === 'PUSHING'}
					<CloudSyncIcon class="size-5 animate-pulse" strokeWidth={1.5} />
				{:else if syncStatus === 'STOPPED'}
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
		{#if hasAnyRetryableUnsynced && syncWorkerState.syncWorker !== null && (syncStatus === 'PULLING' || syncStatus === 'PUSHING')}
			<Button
				size="sm"
				class="w-full"
				variant="secondary"
				onclick={() => syncWorkerState.syncWorker?.forceSync({ overrideBackoff: true })}
			>
				Sync now <RefreshCcwIcon />
			</Button>
		{/if}
	</Popover.Content>
</Popover.Root>
