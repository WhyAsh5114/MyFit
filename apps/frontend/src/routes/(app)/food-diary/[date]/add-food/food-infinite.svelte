<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import { useSearchNutritionData } from '$lib/features/food-diary/nutrition-data/queries/search';
	import { InfiniteLoader, LoaderState } from 'svelte-infinite';
	import { CloudOffIcon, PlusIcon, SearchIcon } from '@lucide/svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { online } from 'svelte/reactivity/window';
	import { m } from '$lib/paraglide/messages';
	import type { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { Component } from 'svelte';

	let { params }: { params: SvelteURLSearchParams } = $props();
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
</script>

{#snippet empty(data: {
	title: string;
	description: string;
	icon: Component;
	showRecipePrompt?: boolean;
})}
	<Empty.Root class="h-full">
		<Empty.Header>
			<Empty.Media variant="icon">
				<data.icon />
			</Empty.Media>
			<Empty.Title>{data.title}</Empty.Title>
			<Empty.Description>{data.description}</Empty.Description>
			{#if data.showRecipePrompt}
				<Empty.Description class="italic">
					<a href={resolve('/food-diary/goals/recipes')}>
						🥣 Create a custom recipe to log groups of foods faster!
					</a>
				</Empty.Description>
			{/if}
		</Empty.Header>
	</Empty.Root>
{/snippet}

{#if !online.current}
	{@render empty({
		title: m['foodDiary.searchFoodsOffline'](),
		description: m['foodDiary.searchFoodsOfflineDescription'](),
		icon: CloudOffIcon
	})}
{:else if search.trim().length === 0}
	{@render empty({
		title: m['foodDiary.searchFoodsEmpty'](),
		description: m['foodDiary.searchFoodsEmptyDescription'](),
		icon: SearchIcon,
		showRecipePrompt: true
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
		description: m['foodDiary.noFoodsFoundDescription'](),
		icon: SearchIcon,
		showRecipePrompt: true
	})}
{:else}
	<ScrollArea class="h-px grow">
		<InfiniteLoader {loaderState} triggerLoad={loadMore}>
			<div class="flex h-full flex-col gap-2">
				{#each searchNutritionData.data?.pages.flatMap((page) => page) as foodEntry (foodEntry.id)}
					<a
						href={resolve(
							`/food-diary/${page.params.date}/add-food/${foodEntry.id}?${params.toString()}`
						)}
					>
						<Item.Root class="flex-nowrap bg-card py-2 shadow-sm" variant="outline">
							<Item.Content class="w-px grow gap-0">
								<Item.Title class="block! w-full! min-w-0 truncate">
									{foodEntry.productName}
								</Item.Title>
								<Item.Description>
									{#if foodEntry.servingSize && foodEntry.servingQuantity}
										{foodEntry.brands ? `${foodEntry.brands} ·` : ''}
										{Math.round(foodEntry.energyKcal_100g * (foodEntry.servingQuantity / 100))} kcal ·
										{foodEntry.servingSize}
									{:else}
										{foodEntry.brands ? `${foodEntry.brands} ·` : ''}
										{Math.round(foodEntry.energyKcal_100g)} kcal · 100g
									{/if}
								</Item.Description>
							</Item.Content>
							<Item.Actions class="shrink-0">
								<Button
									size="icon"
									aria-label={m['foodDiary.addFood']()}
									class="ml-2 rounded-full"
									variant="outline"
								>
									<PlusIcon />
								</Button>
							</Item.Actions>
						</Item.Root>
					</a>
				{/each}
			</div>

			{#snippet loading()}
				<div class="flex items-center justify-center py-4">
					<Spinner />
				</div>
			{/snippet}

			{#snippet error(retry)}
				<div class="flex flex-col items-center justify-center gap-2 py-4">
					<p>Error loading foods</p>
					<Button onclick={retry} variant="outline">Retry</Button>
				</div>
			{/snippet}
		</InfiniteLoader>
	</ScrollArea>
{/if}
