<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { dateFormatter, round } from '$lib/my-utils';
	import { CalendarDate } from '@internationalized/date';
	import { AppleIcon, PlusIcon, ScanBarcodeIcon } from '@lucide/svelte';
	import { m } from '$lib/paraglide/messages';
	import type { FoodEntry } from '@myfit/api/prisma/client';
	import * as Item from '$lib/components/ui/item/index.js';
	import { Spinner } from '$lib/components/ui/spinner';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { cn } from '$lib/utils';
	import Button from '$lib/components/ui/button/button.svelte';

	type Props = {
		foodEntries?: FoodEntry[];
		meals: string[];
		selectedDay: CalendarDate;
		timezone: string;
	};
	let { foodEntries, selectedDay, timezone, meals }: Props = $props();

	function groupedFoodEntriesByMeal(foodEntries: FoodEntry[]) {
		const groups: { meal: string | null; mealLabel: string; entries: FoodEntry[] }[] = meals.map(
			(meal) => ({
				meal,
				mealLabel: meal,
				entries: []
			})
		);

		for (const entry of foodEntries) {
			const mealLabel = entry.meal ?? 'No meal';
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

	function getGroupSummary(group: { meal: string | null; entries: FoodEntry[] }) {
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

{#if foodEntries === undefined}
	<Empty.Root>
		<Empty.Header>
			<Empty.Media variant="icon">
				<Spinner />
			</Empty.Media>
			<Empty.Title>{m['foodDiary.loadingEntries']()}</Empty.Title>
			<Empty.Description>
				{m['foodDiary.loadingEntriesDescription']({
					date: dateFormatter.format(selectedDay.toDate(timezone))
				})}
			</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{:else if foodEntries.length === 0}
	<Empty.Root>
		<Empty.Header>
			<Empty.Media variant="icon">
				<AppleIcon />
			</Empty.Media>
			<Empty.Title>{m['foodDiary.noEntries']()}</Empty.Title>
			<Empty.Description>
				{m['foodDiary.noEntriesDescription']({
					date: dateFormatter.format(selectedDay.toDate(timezone))
				})}
			</Empty.Description>
		</Empty.Header>
		<Empty.Content class="grid grid-cols-2 gap-2">
			<Button variant="secondary" href={resolve(`/food-diary/${page.params.date}/add/scan`)}>
				<ScanBarcodeIcon />
				{m['foodDiary.scanBarcode']()}
			</Button>
			<Button href={resolve(`/food-diary/${page.params.date}/add`)}>
				<PlusIcon />
				{m['foodDiary.addFood']()}
			</Button>
		</Empty.Content>
	</Empty.Root>
{:else}
	<ScrollArea class="h-px grow">
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
								href={resolve(`/food-diary/${page.params.date}/add?meal=${group.meal ?? ''}`)}
								{...props}
							>
								<Item.Header>
									<Item.Content>
										<Item.Title class="flex w-full font-semibold">
											{group.mealLabel}
											<div class="ml-auto flex items-center gap-1 text-xs">
												<PlusIcon class="size-4" strokeWidth={2.5} />
											</div>
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
								</Item.Header>
							</a>
						{/snippet}
					</Item.Root>
					<div class="flex w-full flex-col">
						{#each group.entries as foodEntry, index (foodEntry.id)}
							<Item.Root
								class={cn('rounded-none py-3 border-0 border-border', {
									'rounded-b-lg': index === group.entries.length - 1,
									'border-b': index < group.entries.length - 1
								})}
							>
								{#snippet child({ props })}
									<a
										href={resolve(`/food-diary/${page.params.date}/edit/${foodEntry.id}`)}
										{...props}
									>
										<Item.Header>
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
										</Item.Header>
									</a>
								{/snippet}
							</Item.Root>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</ScrollArea>
{/if}
