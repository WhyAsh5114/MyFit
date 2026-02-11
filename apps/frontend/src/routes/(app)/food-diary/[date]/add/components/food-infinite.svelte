<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { useSearchFoodsQuery } from '$lib/queries/food-diary/search-foods';
	import { PlusIcon, SearchIcon } from '@lucide/svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { search }: { search: string } = $props();

	const searchFoodsQuery = useSearchFoodsQuery(() => search);
</script>

{#if search.trim().length === 0}
	<Empty.Root class="h-full">
		<Empty.Header>
			<Empty.Media variant="icon">
				<SearchIcon />
			</Empty.Media>
			<Empty.Title>Search foods</Empty.Title>
			<Empty.Description>
				Type in the search box above to find foods to add to your diary
			</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else if searchFoodsQuery.isLoading}
	<Empty.Root class="h-full">
		<Empty.Header>
			<Empty.Media variant="icon">
				<Spinner />
			</Empty.Media>
			<Empty.Title>Searching...</Empty.Title>
			<Empty.Description>Fetching foods that match your search</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else if searchFoodsQuery.data?.length === 0}
	<Empty.Root class="h-full">
		<Empty.Header>
			<Empty.Media variant="icon">
				<SearchIcon />
			</Empty.Media>
			<Empty.Title>No foods found</Empty.Title>
			<Empty.Description>Try another search or add the food manually</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else}
	<ScrollArea class="h-px grow">
		<div class="flex h-full flex-col gap-2">
			{#each searchFoodsQuery.data as foodEntry (foodEntry.id)}
				<a href={resolve(`/food-diary/${page.params.date}/add/${foodEntry.code}`)}>
					<Card.Root>
						<Card.Header>
							<Card.Title>{foodEntry.product_name}</Card.Title>
							<Card.Description>
								{foodEntry.brands ?? 'No brand'}, {Math.round(foodEntry.energy_kcal_100g)} kcal per 100g
							</Card.Description>
							<Card.Action>
								<Button
									size="icon"
									aria-label="Add food"
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
	</ScrollArea>
{/if}
