<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { dateFormatter, round } from '$lib/my-utils';
	import { CalendarDate } from '@internationalized/date';
	import { AppleIcon, ChevronRightIcon, PlusIcon } from '@lucide/svelte';
	import { m } from '$lib/paraglide/messages';
	import type { FoodEntry } from '@myfit/api/prisma/client';
	import * as Item from '$lib/components/ui/item/index.js';
	import { Spinner } from '$lib/components/ui/spinner';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { cn } from '$lib/utils';

	type Props = {
		foodEntries?: FoodEntry[];
		selectedDay: CalendarDate;
		timezone: string;
	};
	let { foodEntries, selectedDay, timezone }: Props = $props();

	function groupedFoodEntriesByMeal(foodEntries: FoodEntry[]) {
		const groups: { meal: string | null; mealLabel: string; entries: FoodEntry[] }[] = [];

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
	</Empty.Root>
{:else}
	<ScrollArea class="h-px grow">
		<div class="flex flex-col gap-2">
			{#each groupedFoodEntriesByMeal(foodEntries) as group (group.mealLabel)}
				{@const groupSummary = getGroupSummary(group)}
				<div class="flex flex-col rounded-lg border">
					<a href={resolve(`/food-diary/${page.params.date}/add?meal=${group.meal ?? ''}`)}>
						<Item.Root class="rounded-none rounded-t-lg bg-secondary/75 px-4 py-2">
							<Item.Header>
								<Item.Content>
									<Item.Title class="flex w-full">
										{group.mealLabel}
										<p class="ml-auto flex items-center gap-2 font-normal">
											{round(groupSummary.calories, 0)} kcal
											<PlusIcon class="size-4" />
										</p>
									</Item.Title>
									<Item.Description class="flex w-full text-xs text-foreground">
										C {groupSummary.carbs.toFixed()}g • F {groupSummary.fat.toFixed()}g • P {groupSummary.protein.toFixed()}g
									</Item.Description>
								</Item.Content>
							</Item.Header>
						</Item.Root>
					</a>
					<div class="flex w-full flex-col">
						{#each group.entries as foodEntry, index (foodEntry.id)}
							<a href={resolve(`/food-diary/${page.params.date}/edit/${foodEntry.id}`)}>
								<Item.Root
									class={cn('rounded-none py-2', {
										'rounded-b-lg': index === group.entries.length - 1
									})}
								>
									<Item.Header>
										<Item.Content>
											<Item.Title class="flex w-full">
												{foodEntry.productName}
												<p
													class="ml-auto flex items-center gap-2 font-normal whitespace-nowrap text-muted-foreground"
												>
													{round(foodEntry.energyKcal_100g * (foodEntry.quantityG / 100), 0)} kcal
													<ChevronRightIcon class="size-4 p-0" />
												</p>
											</Item.Title>
											<Item.Description class="flex w-full text-xs">
												{#if foodEntry.servingQuantity && foodEntry.servingSize}
													{round(foodEntry.quantityG / foodEntry.servingQuantity)} •
													{foodEntry.servingSize}
												{:else}
													{round(foodEntry.quantityG)} g
												{/if}
											</Item.Description>
										</Item.Content>
									</Item.Header>
								</Item.Root>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</ScrollArea>
{/if}
