<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import H2 from '$lib/components/ui/typography/H2.svelte';

	import AddIcon from 'virtual:icons/lucide/plus';
	import SearchIcon from 'virtual:icons/lucide/search';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';

	import { afterNavigate, goto } from '$app/navigation';
	import { InfiniteLoader, loaderState } from 'svelte-infinite';
	import { page } from '$app/stores';
	import type { Mesocycle } from '@prisma/client';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { toast } from 'svelte-sonner';
	import type { ActionResult } from '@sveltejs/kit';
	import { deserialize } from '$app/forms';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	let { data } = $props();
	let mesocycles: Mesocycle[] | 'loading' = $state('loading');
	let searchString = $state($page.url.searchParams.get('search') ?? '');

	afterNavigate(async () => {
		loaderState.reset();
		mesocycles = await data.mesocycles;
		if (mesocycles.length !== data.mesocyclesTake) loaderState.complete();
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

		const response = await fetch('?/load_more_mesocycles', {
			method: 'POST',
			body: JSON.stringify({ cursorId: lastMesocycle.id })
		});
		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'failure') {
			toast.error(result.data?.message);
			loaderState.error();
			return;
		} else if (result.type === 'success') {
			const newMesocycles = result.data as Mesocycle[];
			if (mesocycles === 'loading') mesocycles = newMesocycles;
			else mesocycles.push(...newMesocycles);
			if (newMesocycles.length !== data.mesocyclesTake) loaderState.complete();
		}
	}
</script>

<H2>Mesocycles</H2>

<div class="flex grow flex-col gap-2">
	<div class="flex gap-1">
		<form class="contents" onsubmit={(e) => updateSearchParam(e)}>
			<Input bind:value={searchString} id="search-mesocycles" placeholder="Search" type="search" />
			<Button variant="secondary" aria-label="search" type="submit">
				<SearchIcon />
			</Button>
		</form>
		<Button aria-label="create-new-mesocycle" href="/mesocycles/manage/basics"><AddIcon /></Button>
	</div>
	<div class="flex h-px grow flex-col gap-1 overflow-y-auto">
		{#if mesocycles === 'loading'}
			{#each Array(data.mesocyclesTake) as _}
				<div class="flex h-12 items-center justify-between rounded-md border bg-card p-2">
					<Skeleton class="text-lg-skeleton" />
					<Skeleton class="badge-skeleton" />
				</div>
			{/each}
		{:else}
			<InfiniteLoader triggerLoad={loadMore}>
				{#each mesocycles as mesocycle}
					<Button
						variant="outline"
						class="mb-1 flex h-12 items-center justify-between rounded-md border bg-card p-2"
						href="/mesocycles/{mesocycle.id}"
					>
						<span class="text-lg font-semibold">{mesocycle.name}</span>
					</Button>
				{:else}
					<div class="muted-text-box">No mesocycles found</div>
				{/each}
				{#snippet loading()}
					<LoaderCircle class="animate-spin" />
				{/snippet}
				{#snippet error(load)}
					<Button variant="outline" onclick={load}>An error occurred. Retry?</Button>
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
