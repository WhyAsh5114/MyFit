<script lang="ts">
	import { round } from '#lib/format.js';
	import { forQuantity, totalMacros } from '#lib/domain/nutrition/portion.js';
	import { PlusIcon } from '@lucide/svelte';
	import type { FoodEntryWithMeal, Row } from '@myfit/shared/client';
	import * as Item from '#lib/components/ui/item/index.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { cn } from '#lib/utils.js';
	import {
		recentChange,
		revealIfRecent
	} from '#lib/features/food-diary/_common/recent-change.svelte.js';

	let { foodEntries, meals = [] }: { foodEntries?: FoodEntryWithMeal[]; meals?: Row<'Meal'>[] } =
		$props();

	function groupedFoodEntriesByMeal(foodEntries?: FoodEntryWithMeal[]) {
		const groups: { meal: Row<'Meal'> | null; mealLabel: string; entries: FoodEntryWithMeal[] }[] =
			meals.map((meal) => ({
				meal,
				mealLabel: meal.name,
				entries: []
			}));

		// An account without meals still needs somewhere to add food from.
		if (groups.length === 0) groups.push({ meal: null, mealLabel: 'No meal', entries: [] });

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
</script>

<div class="flex flex-col gap-2">
	{#each groupedFoodEntriesByMeal(foodEntries) as group (group.mealLabel)}
		{@const groupSummary = totalMacros(group.entries)}
		<div class="flex flex-col rounded-lg border shadow-sm">
			<Item.Root
				class={cn('rounded-none rounded-t-lg bg-card py-3', {
					'rounded-b-lg': group.entries.length === 0
				})}
			>
				{#snippet child({ props })}
					<a
						href={resolve(
							`food-diary/${page.params.date}/add-food?meal-id=${group.meal?.id ?? ''}`
						)}
						{...props}
					>
						<Item.Content>
							<Item.Title class="flex w-full font-semibold">
								{group.mealLabel}
								<PlusIcon class="ml-auto size-4" strokeWidth={2.5} />
							</Item.Title>
							{#if group.entries.length > 0}
								<!-- Each letter sits close to its amount, with more room between macros. -->
								<Item.Description
									class="flex w-full gap-3 text-xs text-muted-foreground tabular-nums"
								>
									<p class="flex gap-1">
										<span class="text-chart-carbs">C</span>
										{groupSummary.carbsG.toFixed()}g
									</p>
									<p class="flex gap-1">
										<span class="text-chart-fat">F</span>
										{groupSummary.fatG.toFixed()}g
									</p>
									<p class="flex gap-1">
										<span class="text-chart-protein">P</span>
										{groupSummary.proteinG.toFixed()}g
									</p>
									<p class="ml-auto">
										{round(groupSummary.kcal, 0)} kcal
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
							'border-b': index < group.entries.length - 1,
							'animate-highlight': recentChange.id === foodEntry.id
						})}
					>
						{#snippet child({ props })}
							<a
								href={resolve(`food-diary/${page.params.date}/edit-food/${foodEntry.id}`)}
								{...props}
								{@attach revealIfRecent(foodEntry.id)}
							>
								<Item.Content>
									<Item.Title class="flex w-full">
										{foodEntry.productName}
										<p
											class="ml-auto font-normal whitespace-nowrap text-muted-foreground tabular-nums"
										>
											<!-- The meal's total carries the unit. -->
											{round(forQuantity(foodEntry.energyKcal_100g, foodEntry.quantityG), 0)}
										</p>
									</Item.Title>
									<Item.Description class="flex w-full text-xs tabular-nums">
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
