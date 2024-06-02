<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import H2 from '$lib/components/ui/typography/H2.svelte';

	import AddIcon from 'virtual:icons/lucide/plus';
	import SearchIcon from 'virtual:icons/lucide/search';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';

	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { ExerciseSplit, ExerciseSplitDay } from '@prisma/client';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';

	type ExerciseSplitWithSplitDays = (ExerciseSplit & { exerciseSplitDays: ExerciseSplitDay[] })[];

	let { data } = $props();
	let exerciseSplits: ExerciseSplitWithSplitDays | 'loading' = $state('loading');
	let searchString = $state($page.url.searchParams.get('search') ?? '');
	let loadingMore = $state(false);
	let hasMore = $state(true);

	afterNavigate(async () => {
		const serverExerciseSplits = await data.exerciseSplits;
		if (serverExerciseSplits.length !== data.exerciseSplitsTake) hasMore = false;
		if (exerciseSplits === 'loading') exerciseSplits = serverExerciseSplits;
		else {
			exerciseSplits.push(...serverExerciseSplits);
			loadingMore = false;
		}
	});

	function updateParams(param: string | number) {
		const url = new URL($page.url);
		if (typeof param === 'string') {
			if (searchString) url.searchParams.set('search', searchString);
			else url.searchParams.delete('search');
			url.searchParams.delete('cursorId');
		} else url.searchParams.set('cursorId', param.toString());
		goto(url);
	}
</script>

<H2>Exercise splits</H2>

<div class="flex grow flex-col gap-2">
	<div class="flex gap-1">
		<Input bind:value={searchString} id="search-exercise-splits" placeholder="Search" />
		<Button variant="secondary" aria-label="search" onclick={() => updateParams(searchString)}>
			<SearchIcon />
		</Button>
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
			<Skeleton class="h-10 w-full" />
		{:else}
			{#each exerciseSplits as exerciseSplit}
				<Button
					variant="outline"
					class="flex h-12 items-center justify-between rounded-md border bg-card p-2"
					href="/exercise-splits/view/{exerciseSplit.id}"
				>
					<span class="text-lg font-semibold">{exerciseSplit.name}</span>
					<Badge>{exerciseSplit.exerciseSplitDays.length} days / cycle</Badge>
				</Button>
			{/each}
			{#if hasMore}
				<Button
					variant="outline"
					class="gap-2"
					disabled={loadingMore}
					onclick={() => {
						const lastExerciseSplit = exerciseSplits.at(-1) as ExerciseSplit;
						loadingMore = true;
						updateParams(lastExerciseSplit.id);
					}}
				>
					Load more
					{#if loadingMore}
						<LoaderCircle class="animate-spin" />
					{/if}
				</Button>
			{/if}
		{/if}
	</div>
</div>
