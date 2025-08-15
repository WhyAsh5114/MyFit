<script lang="ts">
	import { page } from '$app/state';
	import H1 from '$lib/components/typography/h1.svelte';
	import H2 from '$lib/components/typography/h2.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import {
		PlusCircleIcon,
		PlusIcon,
		ScanBarcodeIcon,
		SearchIcon,
		SearchXIcon
	} from '@lucide/svelte';
	import { Debounced } from 'runed';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { searchFoods } from '../food.remote';

	let selectedDay = $state<string>(null!);
	onMount(() => (selectedDay = page.url.searchParams.get('day')!));

	let searchTerm = $state('');
	const debounced = new Debounced(() => searchTerm, 500);

	const searchQuery = createQuery(() => ({
		queryFn: async () => {
			if (!debounced.current) return [];
			try {
				return await searchFoods({ query: debounced.current });
			} catch (error) {
				toast.error('Error fetching food data');
				console.error('Error fetching food data:', error);
			}
			return [];
		},
		queryKey: ['food-search', debounced.current],
		enabled: Boolean(debounced.current)
	}));
</script>

<H1>Food diary</H1>
<H2>Add food</H2>

<div class="flex w-full flex-col gap-1.5">
	<Label for="search-food">Search for foods</Label>
	<Input type="text" placeholder="Type here" id="search-food" bind:value={searchTerm} />
</div>

<div class="flex justify-between gap-2">
	<Button href="/food-diary/add/manual?day={selectedDay}" variant="secondary">
		<PlusCircleIcon /> Add manually
	</Button>
	<Button href="/food-diary/add/scan?day={selectedDay}">
		<ScanBarcodeIcon /> Scan barcode
	</Button>
</div>

{#if searchQuery.isFetching}
	<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
		<SearchIcon size={128} strokeWidth={1} />
		<span>Searching</span>
	</div>
{:else if !searchQuery.data}
	<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
		<SearchIcon size={128} strokeWidth={1} />
		<span>Search to find food items</span>
	</div>
{:else if searchQuery.data.length === 0}
	<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
		<SearchXIcon size={128} strokeWidth={1} />
		<span>No results found</span>
	</div>
{:else}
	<ScrollArea class="h-px grow">
		<div class="flex flex-col gap-2">
			{#each searchQuery.data as result (result.id)}
				<div class="bg-card flex w-full justify-between gap-2 rounded-md border p-4">
					<div class="flex w-3/4 flex-col justify-between">
						<p class="truncate">{result.product_name}</p>
						<p class="text-muted-foreground text-sm">
							{result.energy_kcal_100g.toFixed()} kcal,
							{result.brands ?? 'Unknown'}
						</p>
					</div>
					<Button
						size="icon"
						class="rounded-full"
						variant="outline"
						href={`${page.url.pathname}/item?id=${result.id}&day=${page.url.searchParams.get('day')}`}
					>
						<PlusIcon />
					</Button>
				</div>
			{/each}
		</div>
	</ScrollArea>
{/if}
