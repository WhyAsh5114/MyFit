<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { useInfiniteSearchFoodsQuery } from '$lib/features/food-diary/nutrition-data/search-foods';
	import { InfiniteLoader, LoaderState } from 'svelte-infinite';
	import { CloudOffIcon, PlusIcon, SearchIcon } from '@lucide/svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { online } from 'svelte/reactivity/window';
	import { m } from '$lib/paraglide/messages';

	let search = $derived(page.url.searchParams.get('search') ?? '');

	const infiniteSearchFoodsQuery = useInfiniteSearchFoodsQuery(() => search);
	const loaderState = new LoaderState();

	const loadMore = async () => {
		await infiniteSearchFoodsQuery.fetchNextPage();
	};

	// Sync query state to loaderState
	$effect(() => {
		if (infiniteSearchFoodsQuery.isError) {
			loaderState.error();
		} else if (!infiniteSearchFoodsQuery.hasNextPage) {
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
{:else if infiniteSearchFoodsQuery.isLoading}
	<Empty.Root class="h-full">
		<Empty.Header>
			<Empty.Media variant="icon">
				<Spinner />
			</Empty.Media>
			<Empty.Title>{m['foodDiary.searching']()}</Empty.Title>
			<Empty.Description>{m['foodDiary.searchingDescription']()}</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else if infiniteSearchFoodsQuery.data?.pages[0]?.length === 0}
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
				{#each infiniteSearchFoodsQuery.data?.pages.flatMap((page) => page) as foodEntry (foodEntry.id)}
					<a href={resolve(`/food-diary/${page.params.date}/add/${foodEntry.id}`)}>
						<Card.Root>
							<Card.Header>
								<Card.Title>{foodEntry.productName}</Card.Title>
								<Card.Description>
									{foodEntry.brands ?? 'No brand'}, {Math.round(foodEntry.energyKcal_100g)} kcal per 100g
								</Card.Description>
								<Card.Action>
									<Button
										size="icon"
										aria-label={m['foodDiary.addFood']()}
										class="ml-2 rounded-full"
										variant="outline"
									>
										<PlusIcon />
									</Button>
								</Card.Action>
							</Card.Header>
						</Card.Root>
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
