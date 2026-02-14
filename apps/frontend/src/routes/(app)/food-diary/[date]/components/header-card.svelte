<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { CalendarDate } from '@internationalized/date';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ChevronLeftIcon, ChevronRightIcon, GoalIcon, PlusIcon } from '@lucide/svelte';
	import { getRelativeDayLabel } from './utils';
	import { dateFormatter } from '$lib/my-utils';
	import { m } from '$lib/paraglide/messages';
	import { useGetMacroMetricsQuery } from '$lib/features/food-diary/macro-metrics/get-macro-metrics';
	import { useGetCurrentUserQuery } from '$lib/features/user/get-current-user';
	import { useGetMacroTargetsQuery } from '$lib/features/food-diary/macro-targets/get-macro-targets';
	import { calculateDailyNutritionStats } from '$lib/domain/nutrition/stats';
	import type { FoodEntry } from '@myfit/api/prisma/client';
	import StackedCaloriesBar from './stacked-calories-bar.svelte';

	type Props = {
		foodEntries?: FoodEntry[];
		selectedDay: CalendarDate;
		timezone: string;
	};
	let { foodEntries, selectedDay, timezone }: Props = $props();

	const getCurrentUserQuery = useGetCurrentUserQuery();
	const getMacroMetricsQuery = useGetMacroMetricsQuery(() => getCurrentUserQuery.data?.id ?? '');
	const getMacroTargetsQuery = useGetMacroTargetsQuery(() => getCurrentUserQuery.data?.id ?? '');

	function changeDay(days: number) {
		selectedDay = selectedDay.add({ days });
		goto(resolve(`/food-diary/${selectedDay.toString()}`));
	}

	let dailyNutritionStats = $derived.by(() => {
		if (!getMacroMetricsQuery.data || getMacroTargetsQuery.data === undefined) return undefined;

		const weeklyCaloricChange = getMacroTargetsQuery.data?.weeklyCaloricChange ?? 0;
		return calculateDailyNutritionStats({
			metrics: getMacroMetricsQuery.data,
			weeklyCaloricChange,
			foodEntries: foodEntries
		});
	});
</script>

<Card.Root>
	<Card.Header class="flex flex-col gap-4">
		<div class="flex w-full">
			<Button size="icon" variant="outline" onclick={() => changeDay(-1)}>
				<ChevronLeftIcon />
			</Button>
			<div class="grid grow place-items-center">
				<Card.Title>{dateFormatter.format(selectedDay.toDate(timezone))}</Card.Title>
				<Card.Description class="text-xs">{getRelativeDayLabel(selectedDay)}</Card.Description>
			</div>
			<Button size="icon" variant="outline" onclick={() => changeDay(1)}>
				<ChevronRightIcon />
			</Button>
		</div>
		{#if dailyNutritionStats}
			<StackedCaloriesBar
				day={selectedDay.toString()}
				{...dailyNutritionStats}
				activityCalories={0}
			/>
		{:else}
			<a
				class="w-full text-center text-sm text-muted-foreground underline"
				href={resolve('/food-diary/goals')}
			>
				You haven't set your goals yet
			</a>
		{/if}
	</Card.Header>
</Card.Root>

<div class="flex justify-end gap-2">
	<Button size="icon" variant="outline" href={resolve('/food-diary/goals')}>
		<GoalIcon />
	</Button>

	<Button href={resolve(`/food-diary/${selectedDay.toString()}/add`)}>
		{m['foodDiary.headerAddFood']()}
		<PlusIcon />
	</Button>
</div>
