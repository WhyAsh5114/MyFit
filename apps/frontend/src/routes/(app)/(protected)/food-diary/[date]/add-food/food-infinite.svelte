<script lang="ts">
	import * as Empty from '#lib/components/ui/empty/index.js';
	import { useSearchNutritionData } from '#lib/features/food-diary/nutrition-data/queries/search.js';
	import { InfiniteLoader, LoaderState } from 'svelte-infinite';
	import { CloudOffIcon, SearchIcon } from '@lucide/svelte';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import Button from '#lib/components/ui/button/button.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { online } from 'svelte/reactivity/window';
	import { m } from '#lib/paraglide/messages.js';
	import type { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { Component } from 'svelte';
	import FoodRow from './food-row.svelte';

	type Props = {
		params: SvelteURLSearchParams;
		/** Your foods matched above, so the database states stay small instead of filling the page. */
		compact: boolean;
	};
	let { params, compact }: Props = $props();
	let search = $derived(page.url.searchParams.get('search') ?? '');

	const searchNutritionData = useSearchNutritionData(() => search);
	const loaderState = new LoaderState();

	const loadMore = async () => {
		await searchNutritionData.fetchNextPage();
	};

	// Sync query state to loaderState
	$effect(() => {
		if (searchNutritionData.isError) {
			loaderState.error();
		} else if (!searchNutritionData.hasNextPage) {
			loaderState.complete();
		} else {
			loaderState.loaded();
		}
	});

	const foodHref = (id: string) =>
		resolve(`food-diary/${page.params.date}/add-food/${id}?${params.toString()}`);
</script>

{#snippet empty(data: { title: string; description: string; icon: Component })}
	{#if compact}
		<p class="flex min-h-11 items-center gap-2 text-sm text-muted-foreground">
			<data.icon class="size-4 shrink-0" />
			{data.description}
		</p>
	{:else}
		<Empty.Root class="h-full">
			<Empty.Header>
				<Empty.Media variant="icon">
					<data.icon />
				</Empty.Media>
				<Empty.Title>{data.title}</Empty.Title>
				<Empty.Description>{data.description}</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{/if}
{/snippet}

{#if !online.current}
	{@render empty({
		title: m['foodDiary.searchFoodsOffline'](),
		description: m['foodDiary.searchFoodsOfflineDescription'](),
		icon: CloudOffIcon
	})}
{:else if searchNutritionData.isLoading}
	{@render empty({
		title: m['foodDiary.searching'](),
		description: m['foodDiary.searchingDescription'](),
		icon: Spinner
	})}
{:else if searchNutritionData.data?.pages[0]?.length === 0}
	{@render empty({
		title: m['foodDiary.noFoodsFound'](),
		description: compact
			? m['foodDiary.noDatabaseMatches']()
			: m['foodDiary.noFoodsFoundDescription'](),
		icon: SearchIcon
	})}
{:else}
	<InfiniteLoader {loaderState} triggerLoad={loadMore}>
		<div class="flex flex-col gap-2">
			{#each searchNutritionData.data?.pages.flatMap((page) => page) as food (food.id)}
				{@const brand = food.brands ? `${food.brands} · ` : ''}
				<FoodRow
					name={food.productName}
					detail={food.servingSize && food.servingQuantity
						? `${brand}${Math.round(food.energyKcal_100g * (food.servingQuantity / 100))} kcal · ${food.servingSize}`
						: `${brand}${Math.round(food.energyKcal_100g)} kcal · 100 g`}
					href={foodHref(food.id)}
					action={{ label: m['foodDiary.addFood'](), href: foodHref(food.id) }}
				/>
			{/each}
		</div>

		{#snippet loading()}
			<div class="flex items-center justify-center py-4">
				<Spinner />
			</div>
		{/snippet}

		<!-- The list itself shows the end; the loader's default texts are English-only. -->
		{#snippet noResults()}{/snippet}
		{#snippet noData()}{/snippet}

		{#snippet error(retry)}
			<div class="flex flex-col items-center justify-center gap-2 py-4">
				<p>{m['foodDiary.errorLoadingFoods']()}</p>
				<Button onclick={retry} variant="outline">{m['common.retry']()}</Button>
			</div>
		{/snippet}
	</InfiniteLoader>
{/if}
