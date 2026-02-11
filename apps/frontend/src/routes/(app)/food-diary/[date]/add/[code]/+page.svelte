<script lang="ts">
	import { page } from '$app/state';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { useGetFoodByCodeQuery } from '$lib/queries/food-diary/get-food-by-code';
	import FoodCard from './components/food-card.svelte';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { PlusCircleIcon, ScanBarcodeIcon, SearchIcon, SearchXIcon } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	const getFoodByCodeQuery = useGetFoodByCodeQuery(() => page.params.code ?? '');
</script>

{#if getFoodByCodeQuery.data === undefined}
	<Skeleton class="h-47 w-full" />
{:else if getFoodByCodeQuery.data === null}
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
	<FoodCard food={getFoodByCodeQuery.data} />
{/if}
