<script lang="ts">
	export let data;
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import H2 from '$lib/components/ui/typography/H2.svelte';

	import AddIcon from 'virtual:icons/lucide/plus';
	import SearchIcon from 'virtual:icons/lucide/search';

	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { type ExerciseSplit } from '@prisma/client';

	let exerciseSplits: ExerciseSplit[] | 'loading' = 'loading';
	let searchString = $page.url.searchParams.get('search') ?? '';

	afterNavigate(async () => {
		exerciseSplits = await data.exerciseSplits;
		console.log(exerciseSplits);
	});

	function updateParams(param: string | number) {
		const url = new URL($page.url);
		if (typeof param === 'string') {
			if (searchString) url.searchParams.set('search', searchString);
			else url.searchParams.delete('search');
			url.searchParams.delete('pageNumber');
		} else {
			url.searchParams.set('pageNumber', param.toString());
		}
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
					<DropdownMenu.Item href="/exercise-splits/new/structure">Start from scratch</DropdownMenu.Item>
					<DropdownMenu.Item href="/exercise-splits/templates">Use template</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="flex h-px grow flex-col gap-1 overflow-y-auto">
		<!-- {#if exerciseSplits === 'loading'}
			<ExerciseSplitsLoading />
		{:else if exerciseSplits === 'error'}
			<div class="muted-text-box">An error occurred</div>
		{:else}
			<ExerciseSplitsContent {exerciseSplits} {exerciseSplitsCount} {updateParams} />
		{/if} -->
	</div>
</div>
