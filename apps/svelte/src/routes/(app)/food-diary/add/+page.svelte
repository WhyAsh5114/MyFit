<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import H2 from '$lib/components/typography/h2.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	import type { Product } from '$lib/types/off';
	import { PlusIcon, SearchIcon, SearchXIcon } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let searchTerm = $state('');
	let debouncedSearchTerm = $state('');
	let debounceTimeout: ReturnType<typeof setTimeout>;

	let searchResults = $state<Product[] | undefined>();

	function debounceSearch() {
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => {
			debouncedSearchTerm = searchTerm;
			handleSearch();
		}, 500);
	}

	async function handleSearch() {
		try {
			const response = await fetch(`/api/food/search?query=${debouncedSearchTerm}`);
			if (!response.ok) throw new Error('Error occurred while fetching food data');
			searchResults = (await response.json()).hits;
		} catch (error) {
			toast.error('Error fetching food data');
			console.error('Error fetching food data:', error);
		}
	}

	onMount(() => {
		return () => {
			clearTimeout(debounceTimeout);
		};
	});
</script>

<H1>Food diary</H1>
<H2>Add food</H2>

<div class="flex w-full flex-col gap-1.5">
	<Label for="search-food">Search for foods</Label>
	<Input
		type="text"
		placeholder="Type here"
		id="search-food"
		bind:value={searchTerm}
		oninput={debounceSearch}
	/>
</div>

{#if searchResults === undefined}
	<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
		<SearchIcon size={128} strokeWidth={1} />
		<span>Search to find food items</span>
	</div>
{:else if searchResults.length === 0}
	<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
		<SearchXIcon size={128} strokeWidth={1} />
		<span>No results found</span>
	</div>
{:else}
	<div class="flex flex-col gap-2">
		{#each searchResults as result (result.code)}
			<div class="bg-card flex w-full justify-between gap-2 rounded-md border p-4">
				<div class="flex w-3/4 flex-col justify-between">
					<p class="truncate">{result.product_name}</p>
					<p class="text-muted-foreground text-sm">
						{result.nutriments?.['energy-kcal_100g'] ?? '?'} kcal,
						{result.brands?.at(0) ?? 'Unknown'}, {result.quantity ?? '?'}
					</p>
				</div>
				<Button size="icon" class="rounded-full" variant="outline"><PlusIcon /></Button>
			</div>
		{/each}
	</div>
{/if}
