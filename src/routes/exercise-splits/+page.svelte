<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import AddIcon from 'virtual:icons/lucide/plus';
	import SearchIcon from 'virtual:icons/lucide/search';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { afterNavigate, goto } from '$app/navigation';
	import { trpc } from '$lib/trpc/client';
	import { InfiniteLoader, loaderState } from 'svelte-infinite';
	import { page } from '$app/stores';
	import type { ExerciseSplit, ExerciseSplitDay } from '@prisma/client';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { exerciseSplitRunes } from './manage/exerciseSplitRunes.svelte.js';

	type ExerciseSplitsWithSplitDays = (ExerciseSplit & { exerciseSplitDays: ExerciseSplitDay[] })[];

	let { data } = $props();
	let exerciseSplits: ExerciseSplitsWithSplitDays | 'loading' = $state('loading');
	let searchString = $state($page.url.searchParams.get('search') ?? '');

	afterNavigate(async () => {
		loaderState.reset();
		exerciseSplits = await data.exerciseSplits;
		if (exerciseSplits.length !== 10) loaderState.complete();
	});

	function updateSearchParam(e: Event) {
		e.preventDefault();
		const url = new URL($page.url);
		if (searchString) url.searchParams.set('search', searchString);
		else url.searchParams.delete('search');

		exerciseSplits = 'loading';
		goto(url);
	}

	async function loadMore() {
		const lastExerciseSplit = exerciseSplits.at(-1);
		if (typeof lastExerciseSplit === 'string' || lastExerciseSplit === undefined) return;

		const newExerciseSplits = await trpc($page).exerciseSplits.load.query({
			cursorId: lastExerciseSplit.id
		});
		if (exerciseSplits !== 'loading') exerciseSplits.push(...newExerciseSplits);
		if (newExerciseSplits.length !== 10) loaderState.complete();
	}

	function createNewExerciseSplit() {
		if (exerciseSplitRunes.editingExerciseSplitId !== null) exerciseSplitRunes.resetStores();
		goto('/exercise-splits/manage/structure');
	}
</script>

<H2>Exercise splits</H2>

<div class="flex grow flex-col gap-2">
	<div class="flex gap-1">
		<form class="contents" onsubmit={updateSearchParam}>
			<Input
				bind:value={searchString}
				id="search-exercise-splits"
				placeholder="Search"
				type="search"
			/>
			<Button variant="secondary" aria-label="search" type="submit">
				<SearchIcon />
			</Button>
		</form>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]} aria-label="exercise-split-new-options"><AddIcon /></Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Group>
					<DropdownMenu.Item onclick={createNewExerciseSplit}>Start from scratch</DropdownMenu.Item>
					<DropdownMenu.Item href="/exercise-splits/templates">Use template</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="flex h-px grow flex-col gap-1 overflow-y-auto">
		{#if exerciseSplits === 'loading'}
			{#each Array(10) as _}
				<div class="flex h-12 items-center justify-between rounded-md border bg-card p-2">
					<Skeleton class="text-lg-skeleton" />
					<Skeleton class="badge-skeleton" />
				</div>
			{/each}
		{:else}
			<InfiniteLoader triggerLoad={loadMore}>
				{#each exerciseSplits as exerciseSplit}
					<Button
						variant="outline"
						class="mb-1 flex h-12 items-center justify-between rounded-md border bg-card p-2"
						href="/exercise-splits/{exerciseSplit.id}"
					>
						<span class="truncate text-lg font-semibold">{exerciseSplit.name}</span>
						<Badge>{exerciseSplit.exerciseSplitDays.length} days / cycle</Badge>
					</Button>
				{:else}
					<div class="muted-text-box">No exercise splits found</div>
				{/each}
				{#snippet loading()}
					<LoaderCircle class="animate-spin" />
				{/snippet}
				{#snippet error(load)}
					<Button variant="outline" onclick={load}>An error occurred. Retry?</Button>
				{/snippet}
				{#snippet noData()}
					{#if exerciseSplits.length > 0}
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
