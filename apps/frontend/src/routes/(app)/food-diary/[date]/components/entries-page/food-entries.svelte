<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { dateFormatter, timeFormatter } from '$lib/my-utils';
	import { CalendarDate } from '@internationalized/date';
	import { AppleIcon, ChevronRightIcon } from '@lucide/svelte';
	import { m } from '$lib/paraglide/messages';
	import type { FoodEntry } from '@myfit/api/prisma/client';
	import * as Item from '$lib/components/ui/item/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
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

	function groupedFoodEntriesByHour(foodEntries: FoodEntry[]) {
		const groups: { hour: number; entries: FoodEntry[] }[] = new Array(24)
			.fill(null)
			.map((_, index) => {
				const hour = index;
				return {
					hour,
					entries: foodEntries.filter((entry) => entry.eatenAt.getHours() === hour)
				};
			})
			.filter((group) => group.entries.length > 0);
		return groups;
	}

	function getHourGroupSummary(group: { hour: number; entries: FoodEntry[] }) {
		const calories = group.entries.reduce((sum, entry) => sum + entry.energyKcal, 0);
		const protein = group.entries.reduce((sum, entry) => sum + entry.proteinG, 0);
		const carbs = group.entries.reduce((sum, entry) => sum + entry.carbsG, 0);
		const fat = group.entries.reduce((sum, entry) => sum + entry.fatG, 0);
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
			{#each groupedFoodEntriesByHour(foodEntries) as group (group.hour)}
				{@const hourSummary = getHourGroupSummary(group)}
				<div class="flex flex-col rounded-lg border">
					<Item.Root class="rounded-none rounded-t-lg px-4 py-2" variant="muted">
						<Item.Header>
							<Item.Content>
								<Item.Title class="flex w-full">
									{group.hour % 12 === 0 ? 12 : group.hour % 12}
									{group.hour < 12 ? 'AM' : 'PM'}
									<p class="ml-auto font-normal">
										{hourSummary.calories} kcal
									</p>
								</Item.Title>
								<Item.Description class="flex w-full text-xs">
									C {hourSummary.carbs.toFixed()}g • F {hourSummary.fat.toFixed()}g • P {hourSummary.protein.toFixed()}g
								</Item.Description>
							</Item.Content>
						</Item.Header>
					</Item.Root>
					<div class="flex w-full flex-col">
						{#each group.entries as foodEntry, index (foodEntry.id)}
							<Separator />
							<a href={resolve(`/food-diary/${page.params.date}/edit/${foodEntry.id}`)}>
								<Item.Root
									class={cn('rounded-none bg-card py-2', {
										'rounded-b-lg': index === group.entries.length - 1
									})}
								>
									<Item.Header>
										<Item.Content>
											<Item.Title class="flex w-full">
												{foodEntry.productName}
												<p
													class="ml-auto flex items-center gap-2 font-normal text-muted-foreground"
												>
													{foodEntry.energyKcal} kcal
													<ChevronRightIcon class="size-4 p-0" />
												</p>
											</Item.Title>
											<Item.Description class="flex w-full text-xs">
												{foodEntry.quantityG}g •&nbsp;
												<p class="font-normal text-muted-foreground">
													{timeFormatter.format(foodEntry.eatenAt)}
												</p>
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
