<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import { useInfiniteSearchNutritionDataQuery } from '$lib/features/food-diary/nutrition-data/search-nutrition-data';
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

	let { params }: { params: SvelteURLSearchParams } = $props();
	let search = $derived(page.url.searchParams.get('search') ?? '');

	const infiniteSearchNutritionDataQuery = useInfiniteSearchNutritionDataQuery(() => search);
	const loaderState = new LoaderState();

	const loadMore = async () => {
		await infiniteSearchNutritionDataQuery.fetchNextPage();
	};

	// Sync query state to loaderState
	$effect(() => {
		if (infiniteSearchNutritionDataQuery.isError) {
			loaderState.error();
		} else if (!infiniteSearchNutritionDataQuery.hasNextPage) {
			loaderState.complete();
		} else {
			loaderState.loaded();
		}
	});
</script>

{#if !online.current}
	<Empty.Root class="h-full">
		<Empty.Header>
			<Empty.Media variant="icon">
				<CloudOffIcon />
			</Empty.Media>
			<Empty.Title>{m['foodDiary.searchFoodsOffline']()}</Empty.Title>
			<Empty.Description>
				{m['foodDiary.searchFoodsOfflineDescription']()}
			</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else if search.trim().length === 0}
	<Empty.Root class="h-full">
		<Empty.Header>
			<Empty.Media variant="icon">
				<SearchIcon />
			</Empty.Media>
			<Empty.Title>{m['foodDiary.searchFoodsEmpty']()}</Empty.Title>
			<Empty.Description>
				{m['foodDiary.searchFoodsEmptyDescription']()}
			</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else if infiniteSearchNutritionDataQuery.isLoading}
	<Empty.Root class="h-full">
		<Empty.Header>
			<Empty.Media variant="icon">
				<Spinner />
			</Empty.Media>
			<Empty.Title>{m['foodDiary.searching']()}</Empty.Title>
			<Empty.Description>{m['foodDiary.searchingDescription']()}</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else if infiniteSearchNutritionDataQuery.data?.pages[0]?.length === 0}
	<Empty.Root class="h-full">
		<Empty.Header>
			<Empty.Media variant="icon">
				<SearchIcon />
			</Empty.Media>
			<Empty.Title>{m['foodDiary.noFoodsFound']()}</Empty.Title>
			<Empty.Description>{m['foodDiary.noFoodsFoundDescription']()}</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else}
	<ScrollArea class="h-px grow">
		<InfiniteLoader {loaderState} triggerLoad={loadMore}>
			<div class="flex h-full flex-col gap-2">
				{#each infiniteSearchNutritionDataQuery.data?.pages.flatMap((page) => page) as foodEntry (foodEntry.id)}
					<a
						href={resolve(
							`/food-diary/${page.params.date}/add/${foodEntry.id}?${params.toString()}`
						)}
					>
						<Item.Root class="py-2 shadow-sm flex-nowrap bg-card" variant="outline">
							<Item.Content class="gap-0 w-px grow">
								<Item.Title class="w-full! min-w-0 block! truncate">{foodEntry.productName}</Item.Title>
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
