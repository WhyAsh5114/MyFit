<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { trpc } from '$lib/trpc/client';
	import type { RouterOutputs } from '$lib/trpc/router.js';
	import { loaderState } from 'svelte-infinite';
	import type { InfiniteEvent } from 'svelte-infinite-loading';
	import AddIcon from 'virtual:icons/lucide/plus';
	import SearchIcon from 'virtual:icons/lucide/search';
	import DefaultInfiniteLoader from '../../lib/components/DefaultInfiniteLoader.svelte';
	import { exerciseSplitRunes } from './manage/exerciseSplitRunes.svelte.js';

	let exerciseSplits: RouterOutputs['exerciseSplits']['load'] = $state([]);
	let searchString = $state($page.url.searchParams.get('search') ?? '');

	function updateSearchParam(e: Event) {
		e.preventDefault();
		const url = new URL($page.url);
		if (searchString) url.searchParams.set('search', searchString);
		else url.searchParams.delete('search');

		exerciseSplits = [];
		goto(url);
	}

	async function loadMore(infiniteEvent: InfiniteEvent) {
		const lastExerciseSplit = exerciseSplits.at(-1);

		const newExerciseSplits = await trpc().exerciseSplits.load.query({
			cursorId: lastExerciseSplit?.id
		});

		if (newExerciseSplits.length === 0) {
			infiniteEvent.detail.complete();
			return;
		}

		infiniteEvent.detail.loaded();
		exerciseSplits.push(...newExerciseSplits);
		if (newExerciseSplits.length < 10) loaderState.complete();
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
			<Input id="search-exercise-splits" placeholder="Search" type="search" bind:value={searchString} />
			<Button aria-label="search" type="submit" variant="secondary">
				<SearchIcon />
			</Button>
		</form>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button aria-label="exercise-split-new-options" builders={[builder]}><AddIcon /></Button>
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
		{#each exerciseSplits as exerciseSplit}
			<Button
				class="flex h-12 items-center justify-between rounded-md border bg-card p-2"
				href="/exercise-splits/{exerciseSplit.id}"
				variant="outline"
			>
				<span class="truncate text-lg font-semibold">{exerciseSplit.name}</span>
				<Badge>{exerciseSplit.exerciseSplitDays.length} days / cycle</Badge>
			</Button>
		{/each}
		<DefaultInfiniteLoader {loadMore} identifier={searchString} entityPlural="exercise splits" />
	</div>
</div>
