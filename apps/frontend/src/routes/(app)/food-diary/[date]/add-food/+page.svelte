<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { ChevronDownIcon, CirclePlusIcon, ScanBarcodeIcon, SearchIcon } from '@lucide/svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Debounced } from 'runed';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import FoodInfinite from './food-infinite.svelte';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { useCurrentUser } from '$lib/features/user/queries/get-current-user';
	import { useMeals } from '$lib/features/food-diary/meals/queries/get';
	import posthog from 'posthog-js';

	const currentUser = useCurrentUser();
	const meals = useMeals(() => currentUser.data?.id ?? '');

	let search = $state(page.url.searchParams.get('search') ?? '');
	const debounced = new Debounced(() => search, 500);
	const params = new SvelteURLSearchParams(page.url.searchParams);

	let searchParamMeal = $derived.by(() => {
		const mealId = params.get('meal-id');
		if (!mealId) return null;
		return meals.data?.find((meal) => meal.id === mealId) ?? null;
	});

	$effect(() => {
		if (debounced.current.trim().length === 0) {
			params.delete('search');
		} else {
			params.set('search', debounced.current);
			posthog.capture('food_searched', { query_length: debounced.current.trim().length });
		}

		goto(resolve(`/food-diary/${page.params.date}/add-food?${params.toString()}`), {
			replaceState: true,
			keepFocus: true
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
						{#each meals.data ?? [] as meal (meal.id)}
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
		href={resolve(`/food-diary/${page.params.date}/add-food/manual?${params.toString()}`)}
	>
		<CirclePlusIcon />
		{m['foodDiary.addManually']()}
	</Button>
	<Button href={resolve(`/food-diary/${page.params.date}/add-food/scan?${params.toString()}`)}>
		{m['foodDiary.scanBarcode']()}
		<ScanBarcodeIcon />
	</Button>
</div>

<FoodInfinite {params} />
