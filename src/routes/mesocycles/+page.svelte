<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import AddIcon from 'virtual:icons/lucide/plus';
	import SearchIcon from 'virtual:icons/lucide/search';
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { trpc } from '$lib/trpc/client.js';
	import type { Mesocycle } from '@prisma/client';
	import { InfiniteLoader, loaderState } from 'svelte-infinite';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { mesocycleRunes } from './manage/mesocycleRunes.svelte.js';

	let { data } = $props();
	let activeMesocycle: Pick<Mesocycle, 'id' | 'name'> | null | 'loading' = $state('loading');
	let mesocycles: Mesocycle[] | 'loading' = $state('loading');
	let searchString = $state($page.url.searchParams.get('search') ?? '');

	afterNavigate(async () => {
		loaderState.reset();
		[activeMesocycle, mesocycles] = await Promise.all([data.activeMesocycle, data.mesocycles]);
		if (mesocycles.length !== 10) loaderState.complete();
	});

	function updateSearchParam(e: Event) {
		e.preventDefault();
		const url = new URL($page.url);
		if (searchString) url.searchParams.set('search', searchString);
		else url.searchParams.delete('search');

		mesocycles = 'loading';
		goto(url);
	}

	async function loadMore() {
		const lastMesocycle = mesocycles.at(-1);
		if (typeof lastMesocycle === 'string' || lastMesocycle === undefined) return;

		const newMesocycles = await trpc($page).mesocycles.load.query({ cursorId: lastMesocycle.id });
		if (mesocycles !== 'loading') mesocycles.push(...newMesocycles);
		if (newMesocycles.length !== 10) loaderState.complete();
	}

	function createNewMesocycle() {
		if (mesocycleRunes.editingMesocycleId !== null) mesocycleRunes.resetStores();
		goto('/mesocycles/manage/basics');
	}
</script>

<H2>Mesocycles</H2>

<div class="flex grow flex-col gap-2">
	<div class="flex gap-1">
		<form class="contents" onsubmit={updateSearchParam}>
			<Input id="search-mesocycles" placeholder="Search" type="search" bind:value={searchString} />
			<Button aria-label="search" type="submit" variant="secondary">
				<SearchIcon />
			</Button>
		</form>
		<Button aria-label="create-new-mesocycle" href="/mesocycles/manage/basics" onclick={createNewMesocycle}
			><AddIcon /></Button
		>
	</div>
	<div class="flex items-center gap-2">
		<span class="text-sm font-medium text-muted-foreground">Active</span>
		<Separator class="w-px grow" />
	</div>
	{#if activeMesocycle === 'loading'}
		<div class="flex h-12 items-center justify-between rounded-md border bg-card p-2">
			<Skeleton class="text-lg-skeleton" />
			<Skeleton class="badge-skeleton" />
		</div>
	{:else if activeMesocycle === null}
		<div class="muted-text-box">No active mesocycle</div>
	{:else}
		<Button
			class="mb-1 flex h-12 items-center justify-between rounded-md border bg-card p-2"
			href="/mesocycles/{activeMesocycle.id}"
			variant="outline"
		>
			<span class="text-lg font-semibold">{activeMesocycle.name}</span>
			<Badge>Active</Badge>
		</Button>
	{/if}

	<div class="flex items-center gap-2">
		<span class="text-sm font-medium text-muted-foreground">All</span>
		<Separator class="w-px grow" />
	</div>
	<div class="flex h-px grow flex-col gap-1 overflow-y-auto">
		{#if mesocycles === 'loading'}
			{#each Array(10) as _}
				<div class="flex h-12 items-center justify-between rounded-md border bg-card p-2">
					<Skeleton class="text-lg-skeleton" />
					<Skeleton class="badge-skeleton" />
				</div>
			{/each}
		{:else}
			<InfiniteLoader triggerLoad={loadMore}>
				{#each mesocycles as mesocycle}
					<Button
						class="mb-1 flex h-12 items-center justify-between rounded-md border bg-card p-2"
						href="/mesocycles/{mesocycle.id}"
						variant="outline"
					>
						<span class="text-lg font-semibold">{mesocycle.name}</span>
						{#if !mesocycle.startDate}
							<Badge variant="secondary">Unused</Badge>
						{:else if !mesocycle.endDate}
							<Badge>Active</Badge>
						{:else}
							<Badge variant="outline">Completed</Badge>
						{/if}
					</Button>
				{:else}
					<div class="muted-text-box">No mesocycles found</div>
				{/each}
				{#snippet loading()}
					<LoaderCircle class="animate-spin" />
				{/snippet}
				{#snippet error(load)}
					<Button onclick={load} variant="outline">An error occurred. Retry?</Button>
				{/snippet}
				{#snippet noData()}
					{#if mesocycles.length > 0}
						<div class="flex items-center justify-start gap-2 font-semibold text-muted-foreground">
							<Separator class="h-0.5 w-20" />
							<span class="whitespace-nowrap">That's all!</span>
							<Separator class="h-0.5 w-20" />
						</div>
					{/if}
				{/snippet}
			</InfiniteLoader>
		{/if}
	</div>
</div>
