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
	import type { ExerciseSplit, ExerciseSplitDay } from '@prisma/client';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { toast } from 'svelte-sonner';
	import type { ActionResult } from '@sveltejs/kit';
	import { deserialize } from '$app/forms';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	type ExerciseSplitsWithSplitDays = (ExerciseSplit & { exerciseSplitDays: ExerciseSplitDay[] })[];

	let { data } = $props();
	let exerciseSplits: ExerciseSplitsWithSplitDays | 'loading' = $state('loading');
	let searchString = $state($page.url.searchParams.get('search') ?? '');

	afterNavigate(async () => {
		loaderState.reset();
		exerciseSplits = await data.exerciseSplits;
		if (exerciseSplits.length !== data.exerciseSplitsTake) loaderState.complete();
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

		const response = await fetch('?/load_more_exercise_splits', {
			method: 'POST',
			body: JSON.stringify({ cursorId: lastExerciseSplit.id })
		});
		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'failure') {
			toast.error(result.data?.message);
			loaderState.error();
			return;
		} else if (result.type === 'success') {
			const newExerciseSplits = result.data as ExerciseSplitsWithSplitDays;
			if (exerciseSplits === 'loading') exerciseSplits = newExerciseSplits;
			else exerciseSplits.push(...newExerciseSplits);
			if (newExerciseSplits.length !== data.exerciseSplitsTake) loaderState.complete();
		}
	}
</script>

<H2>Exercise splits</H2>

<div class="flex grow flex-col gap-2">
	<div class="flex gap-1">
		<form class="contents" onsubmit={(e) => updateSearchParam(e)}>
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
					<DropdownMenu.Item href="/exercise-splits/new/structure">
						Start from scratch
					</DropdownMenu.Item>
					<DropdownMenu.Item href="/exercise-splits/templates">Use template</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="flex h-px grow flex-col gap-1 overflow-y-auto">
		{#if exerciseSplits === 'loading'}
			{#each Array(data.exerciseSplitsTake) as _}
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
						<span class="text-lg font-semibold">{exerciseSplit.name}</span>
						<Badge>{exerciseSplit.exerciseSplitDays.length} days / cycle</Badge>
					</Button>
				{:else}
					<div class="muted-text-box">No exercise splits created</div>
				{/each}
				{#snippet loading()}
					<LoaderCircle class="animate-spin" />
				{/snippet}
				{#snippet error(load)}
					<Button variant="outline" onclick={load}>An error occurred. Retry?</Button>
				{/snippet}
				{#snippet noData()}
					<div class="flex items-center justify-start gap-2 font-semibold text-muted-foreground">
						<Separator class="h-0.5 w-20" />
						<span class="whitespace-nowrap">That's all!</span>
						<Separator class="h-0.5 w-20" />
					</div>
				{/snippet}
			</InfiniteLoader>
		{/if}
	</div>
</div>
