<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { Input } from '$lib/components/ui/input';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';

	import AddIcon from 'virtual:icons/material-symbols/add';
	import SearchIcon from 'virtual:icons/material-symbols/search';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';

	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { getTotalSetsOfSplit } from '$lib/utils/exerciseSplits';
	import { EXERCISE_SPLITS_PER_PAGE } from '$lib/constants';

	let searchString = '';
	let exerciseSplitsCount: number;
	let exerciseSplits: WithSID<ExerciseSplit>[] | null | undefined;

	onMount(() => loadExerciseSplits(1, true));

	async function loadExerciseSplits(pageNumber: number, includeTotalCount = false) {
		exerciseSplits = undefined;
		let fetchURL = `/api/exercise-splits?page=${pageNumber}`;
		if (searchString) fetchURL += `&search=${searchString}`;
		if (includeTotalCount) fetchURL += '&includeTotalCount';

		const response = await fetch(fetchURL);
		if (response.ok) {
			if (includeTotalCount) ({ exerciseSplits, exerciseSplitsCount } = await response.json());
			else ({ exerciseSplits } = await response.json());
		} else {
			toast.error(`Error ${response.status}`, { description: await response.text() });
			exerciseSplits = null;
		}
		console.log(includeTotalCount, exerciseSplitsCount);
	}
</script>

<H2>Exercise splits</H2>
<div class="flex grow flex-col gap-2">
	<div class="flex gap-1">
		<Input bind:value={searchString} id="search-exercise-splits" placeholder="Search" />
		<Button variant="secondary" on:click={() => loadExerciseSplits(1, true)}><SearchIcon /></Button>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]}><AddIcon /></Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<a href="/exercise-splits/new">Start from scratch</a>
					</DropdownMenu.Item>
					<DropdownMenu.Item>Use template</DropdownMenu.Item>
					<DropdownMenu.Item>Clone older split</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="flex h-px grow flex-col gap-1 overflow-y-auto">
		{#if exerciseSplits}
			{#each exerciseSplits as exerciseSplit}
				<div class="flex flex-col gap-2 rounded-md border p-2">
					<div class="flex items-center justify-between">
						<span class="text-lg font-semibold">{exerciseSplit.name}</span>
						<span class="text-sm text-muted-foreground">
							{getTotalSetsOfSplit(exerciseSplit.splitDays)} sets
						</span>
					</div>
					<div class="flex w-full flex-wrap gap-1">
						{#each exerciseSplit.splitDays as splitDay}
							<Badge variant={splitDay ? 'secondary' : 'outline'}>
								{splitDay?.name ?? 'Rest'}
							</Badge>
						{/each}
					</div>
				</div>
			{/each}
		{:else if exerciseSplits === undefined}
			{#each Array(EXERCISE_SPLITS_PER_PAGE) as _}
				<div class="flex flex-col gap-2 rounded-md border p-2">
					<div class="flex items-center justify-between">
						<Skeleton class="h-7 w-28" />
						<Skeleton class="h-[22px] w-16 rounded-full" />
					</div>
					<div class="flex w-full flex-wrap gap-1">
						{#each Array(7) as __}
							<Skeleton class="h-[22px] w-16 rounded-full" />
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</div>

	{#if exerciseSplitsCount !== undefined}
		<Pagination.Root
			count={exerciseSplitsCount}
			perPage={EXERCISE_SPLITS_PER_PAGE}
			siblingCount={0}
			onPageChange={(pageNumber) => {
				loadExerciseSplits(pageNumber);
			}}
			let:pages
			let:currentPage
		>
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.PrevButton>
						<ChevronLeft class="h-4 w-4" />
						<span class="hidden sm:block">Previous</span>
					</Pagination.PrevButton>
				</Pagination.Item>
				{#each pages as page (page.key)}
					{#if page.type === 'ellipsis'}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item>
							<Pagination.Link {page} isActive={currentPage == page.value}>
								{page.value}
							</Pagination.Link>
						</Pagination.Item>
					{/if}
				{/each}
				<Pagination.Item>
					<Pagination.NextButton>
						<span class="hidden sm:block">Next</span>
						<ChevronRight class="h-4 w-4" />
					</Pagination.NextButton>
				</Pagination.Item>
			</Pagination.Content>
		</Pagination.Root>
	{/if}
</div>
