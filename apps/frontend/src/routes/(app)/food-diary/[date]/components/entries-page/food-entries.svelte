<script lang="ts">
	import { round } from '$lib/my-utils';
	import { PlusIcon } from '@lucide/svelte';
	import type { Meal, Prisma } from '@myfit/api/prisma/client';
	import * as Item from '$lib/components/ui/item/index.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';

	type FoodEntryWithMeal = Prisma.FoodEntryGetPayload<{ include: { meal: true } }>;
	let { foodEntries, meals = [] }: { foodEntries?: FoodEntryWithMeal[]; meals?: Meal[] } = $props();

	function groupedFoodEntriesByMeal(foodEntries?: FoodEntryWithMeal[]) {
		const groups: { meal: Meal | null; mealLabel: string; entries: FoodEntryWithMeal[] }[] =
			meals.map((meal) => ({
				meal,
				mealLabel: meal.name,
				entries: []
			}));

		for (const entry of foodEntries ?? []) {
			const mealLabel = entry.meal?.name ?? 'No meal';
			const existingGroup = groups.find((g) => g.mealLabel === mealLabel);

			if (existingGroup) {
				existingGroup.entries.push(entry);
			} else {
				groups.push({
					meal: entry.meal,
					mealLabel,
					entries: [entry]
				});
			}
		}

		return groups;
	}

	function getGroupSummary(group: { entries: FoodEntryWithMeal[] }) {
		const calories = group.entries.reduce(
			(sum, entry) => sum + entry.energyKcal_100g * (entry.quantityG / 100),
			0
		);
		const protein = group.entries.reduce(
			(sum, entry) => sum + entry.proteinsG_100g * (entry.quantityG / 100),
			0
		);
		const carbs = group.entries.reduce(
			(sum, entry) => sum + entry.carbohydratesG_100g * (entry.quantityG / 100),
			0
		);
		const fat = group.entries.reduce(
			(sum, entry) => sum + entry.fatG_100g * (entry.quantityG / 100),
			0
		);
		return { calories, protein, carbs, fat };
	}
</script>

<div class="flex flex-col gap-2">
	{#each groupedFoodEntriesByMeal(foodEntries) as group (group.mealLabel)}
		{@const groupSummary = getGroupSummary(group)}
		<div class="flex flex-col rounded-lg border shadow-sm">
			<Item.Root
				class={cn('rounded-none rounded-t-lg bg-card py-3', {
					'rounded-b-lg py-2': group.entries.length === 0
				})}
			>
				{#snippet child({ props })}
					<a
						href={resolve(`/food-diary/${page.params.date}/add-food?meal=${group.meal?.name ?? ''}`)}
						{...props}
					>
						<Item.Content>
							<Item.Title class="flex w-full font-semibold">
								{group.mealLabel}
								<PlusIcon class="ml-auto size-4" strokeWidth={2.5} />
							</Item.Title>
							{#if group.entries.length > 0}
								<Item.Description class="flex w-full gap-1 text-xs text-muted-foreground">
									<p>
										<span class="text-chart-carbs">C</span>
										{groupSummary.carbs.toFixed()}g
									</p>
									<p>
										<span class="text-chart-fat">F</span>
										{groupSummary.fat.toFixed()}g
									</p>
									<p>
										<span class="text-chart-protein">P</span>
										{groupSummary.protein.toFixed()}g
									</p>
									<p class="ml-auto">
										{round(groupSummary.calories, 0)} kcal
									</p>
								</Item.Description>
							{/if}
						</Item.Content>
					</a>
				{/snippet}
			</Item.Root>
			<div class="flex w-full flex-col">
				{#each group.entries as foodEntry, index (foodEntry.id)}
					<Item.Root
						class={cn('rounded-none border-0 border-border py-3', {
							'rounded-b-lg': index === group.entries.length - 1,
							'border-b': index < group.entries.length - 1
						})}
					>
						{#snippet child({ props })}
							<a
								href={resolve(`/food-diary/${page.params.date}/edit-food/${foodEntry.id}`)}
								{...props}
							>
								<Item.Content>
									<Item.Title class="flex w-full">
										{foodEntry.productName}
										<p class="ml-auto font-normal whitespace-nowrap text-muted-foreground">
											{round(foodEntry.energyKcal_100g * (foodEntry.quantityG / 100), 0)} kcal
										</p>
									</Item.Title>
									<Item.Description class="flex w-full text-xs">
										{#if foodEntry.servingQuantity && foodEntry.servingSize}
											{@const calculatedQuantity = round(
												foodEntry.quantityG / foodEntry.servingQuantity,
												2
											)}
											{#if calculatedQuantity !== 1}
												{calculatedQuantity} •
											{/if}
											{foodEntry.servingSize}
										{:else}
											{round(foodEntry.quantityG)} g
										{/if}
									</Item.Description>
								</Item.Content>
							</a>
						{/snippet}
					</Item.Root>
				{/each}
			</div>
		</div>
	{/each}
</div>
