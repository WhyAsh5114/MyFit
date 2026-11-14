<script lang="ts">
	import Button from '#lib/components/ui/button/button.svelte';
	import Label from '#lib/components/ui/label/label.svelte';
	import { ChevronDownIcon, CirclePlusIcon, ScanBarcodeIcon, SearchIcon } from '@lucide/svelte';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import { Debounced } from 'runed';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import FoodInfinite from './food-infinite.svelte';
	import YourFoods from './your-foods.svelte';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import posthog from 'posthog-js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import { matchesHistorySearch } from '#lib/domain/food-history/rank.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let search = $state(page.url.searchParams.get('search') ?? '');
	const debounced = new Debounced(() => search, 500);
	const params = new SvelteURLSearchParams(page.url.search);

	let searchParamMeal = $derived.by(() => {
		const mealId = params.get('meal-id');
		if (!mealId) return null;
		return data.meals.find((meal) => meal.id === mealId) ?? null;
	});

	/** Enough of your foods to scroll through; searching reaches the rest. */
	const HISTORY_ROWS = 50;
	/** Matches of your foods above the database while typing, so its results stay in view. */
	const HISTORY_MATCHES = 3;

	const typed = $derived(search.trim());
	const urlSearch = $derived(page.url.searchParams.get('search')?.trim() ?? '');
	const yourFoods = $derived(
		typed.length === 0
			? data.history.foods.slice(0, HISTORY_ROWS)
			: data.history.foods
					.filter((food) => matchesHistorySearch(food.latest, typed))
					.slice(0, HISTORY_MATCHES)
	);

	// The search the page opened with isn't a new search, so it isn't tracked.
	let trackedQuery = page.url.searchParams.get('search')?.trim() ?? '';
	$effect(() => {
		const query = debounced.current.trim();
		if (query === trackedQuery) return;
		trackedQuery = query;
		if (query.length > 0) posthog.capture('food_searched', { query_length: query.length });
	});

	// Keeps the URL in step with the search text and the meal filter, which the child pages read.
	$effect(() => {
		if (debounced.current.trim().length === 0) {
			params.delete('search');
		} else {
			params.set('search', debounced.current);
		}

		// Already there on first render, and after the navigation below lands.
		if (params.toString() === new URLSearchParams(page.url.search).toString()) return;

		goto(resolve(`food-diary/${page.params.date}/add-food?${params.toString()}`), {
			replace: true,
			reset: false
		});
	});
</script>

<div class="grid grid-cols-2 gap-2">
	<Label class="col-span-2 flex flex-col items-start">
		{m['foodDiary.searchForFoods']()}
		<InputGroup.Root class="w-full">
			<InputGroup.Addon>
				<SearchIcon />
			</InputGroup.Addon>
			<InputGroup.Input
				type="text"
				placeholder={m['foodDiary.searchPlaceholder']()}
				bind:value={search}
			/>
			<InputGroup.Addon align="inline-end">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<InputGroup.Button {...props} variant="ghost" class="pe-1.5! text-xs">
								{searchParamMeal?.name ?? m['foodDiary.noMealFilter']()}
								<ChevronDownIcon class="size-3" />
							</InputGroup.Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						{#each data.meals as meal (meal.id)}
							<DropdownMenu.Item onclick={() => params.set('meal-id', meal.id)}>
								{meal.name}
							</DropdownMenu.Item>
						{/each}
						<DropdownMenu.Item onclick={() => params.delete('meal-id')}>
							{m['foodDiary.noMealFilter']()}
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</InputGroup.Addon>
		</InputGroup.Root>
	</Label>
	<Button
		variant="secondary"
		href={resolve(`food-diary/${page.params.date}/add-food/manual?${params.toString()}`)}
	>
		<CirclePlusIcon />{m['foodDiary.addManually']()}
	</Button>

	<Button href={resolve(`food-diary/${page.params.date}/add-food/scan?${params.toString()}`)}>
		{m['foodDiary.scanBarcode']()}
		<ScanBarcodeIcon />
	</Button>
</div>

<div class="flex min-h-0 grow basis-0 flex-col gap-2 overflow-y-auto">
	{#if yourFoods.length > 0}
		<YourFoods
			foods={yourFoods}
			mealTimes={data.history.mealTimes}
			meals={data.meals}
			mealFilterId={searchParamMeal?.id ?? null}
			{params}
			date={page.params.date}
			ownerId={data.ownerId}
		/>
	{:else if typed.length === 0}
		<Empty.Root class="h-full">
			<Empty.Header>
				<Empty.Media variant="icon">
					<SearchIcon />
				</Empty.Media>
				<Empty.Title>{m['foodDiary.searchFoodsEmpty']()}</Empty.Title>
				<Empty.Description>{m['foodDiary.searchFoodsEmptyDescription']()}</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{/if}

	{#if typed.length > 0 && urlSearch.length > 0}
		{#if yourFoods.length > 0}
			<h2 class="mt-2 text-sm font-medium text-muted-foreground">
				{m['foodDiary.foodDatabase']()}
			</h2>
		{/if}
		<FoodInfinite {params} compact={yourFoods.length > 0} />
	{/if}
</div>
