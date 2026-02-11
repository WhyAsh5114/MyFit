<script lang="ts">
	import { page } from '$app/state';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { useGetFoodByCodeQuery } from '$lib/queries/food-diary/get-food-by-code';
	import FoodCard from './components/food-card.svelte';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { PlusCircleIcon, ScanBarcodeIcon, SearchIcon, SearchXIcon } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import EntryForm from './components/entry-form.svelte';
	import type { FoodEntryFormSchema } from './components/food-entry-form-schema';
	import { useCurrentUserQuery } from '$lib/queries/user/get-current-user';

	const currentUserQuery = useCurrentUserQuery();
	const getFoodByCodeQuery = useGetFoodByCodeQuery(() => page.params.code ?? '');

	let foodData = $derived.by(() => {
		if (!getFoodByCodeQuery.data) return getFoodByCodeQuery.data;
		return { ...getFoodByCodeQuery.data, quantity: 100 };
	});

	function handleChange(data: FoodEntryFormSchema) {
		if (!foodData) return;
		foodData = { ...foodData, ...data };
	}
</script>

{#if foodData === undefined || !currentUserQuery.data}
	<Skeleton class="h-47 w-full" />
	<Skeleton class="h-64 w-full" />
	<Skeleton class="mt-auto h-9 w-full" />
{:else if foodData === null}
	<Empty.Root>
		<Empty.Header>
			<Empty.Media variant="icon">
				<SearchXIcon />
			</Empty.Media>
			<Empty.Title>No food found</Empty.Title>
			<Empty.Description>
				Food with this code couldn't be found. Try some other options?
			</Empty.Description>
		</Empty.Header>
		<Empty.Content class="grid gap-2">
			<Button>
				<ScanBarcodeIcon /> Scan barcode
			</Button>
			<Button variant="secondary">
				<SearchIcon /> Search for foods
			</Button>
			<Button variant="outline">
				<PlusCircleIcon /> Add manually
			</Button>
		</Empty.Content>
	</Empty.Root>
{:else}
	<FoodCard food={foodData} />
	<EntryForm userId={currentUserQuery.data.id} food={foodData} onChange={handleChange} />
{/if}
