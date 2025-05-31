<script lang="ts">
	import { page } from '$app/state';
	import H1 from '$lib/components/typography/h1.svelte';
	import H2 from '$lib/components/typography/h2.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	import type { NutritionData } from '@prisma/client';
	import { createQuery } from '@tanstack/svelte-query';
	import { PlusIcon, SearchIcon, SearchXIcon } from 'lucide-svelte';
	import { Debounced } from 'runed';
	import { toast } from 'svelte-sonner';
	import { derived, writable } from 'svelte/store';

	let searchTerm = $state('');
	const debounced = new Debounced(() => searchTerm, 500);
	const debouncedValue = writable(debounced.current);

	$effect(() => {
		$debouncedValue = debounced.current;
	});

	const searchQuery = createQuery(
		derived(debouncedValue, ($debouncedValue) => ({
			queryFn: async () => {
				if (!$debouncedValue) return [];
				try {
					const response = await fetch(`/api/food/search?query=${$debouncedValue}`);
					if (!response.ok) throw new Error('Error occurred while fetching food data');
					return (await response.json()) as (Omit<NutritionData, 'code'> & { code: string })[];
				} catch (error) {
					toast.error('Error fetching food data');
					console.error('Error fetching food data:', error);
				}
				return null;
			},
			// TODO: use this when tanstack-svelte v6 is released and remove the effect, writable store, and derived wrapper function:
			// queryKey: () => ['food-search', debounced.current],
			queryKey: ['food-search', $debouncedValue],
			enabled: Boolean($debouncedValue)
		}))
	);
</script>

<H1>Food diary</H1>
<H2>Add food</H2>

<div class="flex w-full flex-col gap-1.5">
	<Label for="search-food">Search for foods</Label>
	<Input type="text" placeholder="Type here" id="search-food" bind:value={searchTerm} />
</div>

{#if $searchQuery.isFetching}
	<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
		<SearchIcon size={128} strokeWidth={1} />
		<span>Searching</span>
	</div>
{:else if !$searchQuery.data}
	<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
		<SearchIcon size={128} strokeWidth={1} />
		<span>Search to find food items</span>
	</div>
{:else if $searchQuery.data.length === 0}
	<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
		<SearchXIcon size={128} strokeWidth={1} />
		<span>No results found</span>
	</div>
{:else}
	<div class="flex flex-col gap-2">
		{#each $searchQuery.data as result (result.code)}
			<div class="bg-card flex w-full justify-between gap-2 rounded-md border p-4">
				<div class="flex w-3/4 flex-col justify-between">
					<p class="truncate">{result.product_name}</p>
					<p class="text-muted-foreground text-sm">
						{result.energy_kcal_100g} kcal,
						{result.brands ?? 'Unknown'}, {result.quantity ?? '1 serving'}
					</p>
				</div>
				<Button
					size="icon"
					class="rounded-full"
					variant="outline"
					href={`${page.url.pathname}/${result.code}?day=${page.url.searchParams.get('day')}`}
				>
					<PlusIcon />
				</Button>
			</div>
		{/each}
	</div>
{/if}
