<script lang="ts">
	import Button from '#lib/components/ui/button/button.svelte';
	import Label from '#lib/components/ui/label/label.svelte';
	import { ChevronDownIcon, CirclePlusIcon, ScanBarcodeIcon, SearchIcon } from '@lucide/svelte';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import { Debounced } from 'runed';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import FoodInfinite from './food-infinite.svelte';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import posthog from 'posthog-js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let search = $state(page.url.searchParams.get('search') ?? '');
	const debounced = new Debounced(() => search, 500);
	const params = new SvelteURLSearchParams(page.url.search);

	let searchParamMeal = $derived.by(() => {
		const mealId = params.get('meal-id');
		if (!mealId) return null;
		return data.meals.find((meal) => meal.id === mealId) ?? null;
	});

	$effect(() => {
		if (debounced.current.trim().length === 0) {
			params.delete('search');
		} else {
			params.set('search', debounced.current);
			posthog.capture('food_searched', { query_length: debounced.current.trim().length });
		}

		goto(resolve(`food-diary/${page.params.date}/add-food?${params.toString()}`), {
			replace: true,
			reset: false
		});
	});
</script>

<div class="grid grid-cols-2 gap-2">
	<Label class="col-span-2 flex flex-col items-start">
		{m['foodDiary.searchForFoods']()}
		<InputGroup.Root class="w-full">
			<InputGroup.Addon>
				<SearchIcon />
			</InputGroup.Addon>
			<InputGroup.Input
				type="text"
				placeholder={m['foodDiary.searchPlaceholder']()}
				bind:value={search}
			/>
			<InputGroup.Addon align="inline-end">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<InputGroup.Button {...props} variant="ghost" class="pe-1.5! text-xs">
								{searchParamMeal?.name ?? m['foodDiary.noMealFilter']()}
								<ChevronDownIcon class="size-3" />
							</InputGroup.Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						{#each data.meals as meal (meal.id)}
							<DropdownMenu.Item onclick={() => params.set('meal-id', meal.id)}>
								{meal.name}
							</DropdownMenu.Item>
						{/each}
						<DropdownMenu.Item onclick={() => params.delete('meal-id')}>
							{m['foodDiary.noMealFilter']()}
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</InputGroup.Addon>
		</InputGroup.Root>
	</Label>
	<Button
		variant="secondary"
		href={resolve(`food-diary/${page.params.date}/add-food/manual?${params.toString()}`)}
	>
		<CirclePlusIcon />{m['foodDiary.addManually']()}
	</Button>

	<Button href={resolve(`food-diary/${page.params.date}/add-food/scan?${params.toString()}`)}>
		{m['foodDiary.scanBarcode']()}
		<ScanBarcodeIcon />
	</Button>
</div>

<FoodInfinite {params} />
