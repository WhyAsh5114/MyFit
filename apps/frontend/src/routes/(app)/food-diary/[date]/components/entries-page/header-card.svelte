<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import Button from '#lib/components/ui/button/button.svelte';
	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte';
	import { dateFormatter } from '#lib/my-utils.js';
	import { useMacroMetricsByDate } from '#lib/features/food-diary/macro-metrics/queries/get-by-date.js';
	import { useMacroTargetsByDate } from '#lib/features/food-diary/macro-targets/queries/get-by-date.js';
	import type { Row } from '@myfit/shared/client';
	import StackedCaloriesBar from './stacked-calories-bar.svelte';
	import { calculateDailyNutritionStats } from '#lib/domain/nutrition/stats.js';
	import { m } from '#lib/paraglide/messages.js';
	import Skeleton from '#lib/components/ui/skeleton/skeleton.svelte';

	type Props = {
		foodEntries?: Row<'FoodEntry'>[];
		activityEntries?: Row<'ActivityEntry'>[];
		selectedDay: CalendarDate;
		timezone: string;
		macroMetrics: ReturnType<typeof useMacroMetricsByDate>;
		macroTargets: ReturnType<typeof useMacroTargetsByDate>;
	};
	let { foodEntries, activityEntries, selectedDay, timezone, macroMetrics, macroTargets }: Props =
		$props();

	function changeDay(days: number) {
		// The route changes the day once its data is loaded, so the date never leads its content.
		goto(resolve(`food-diary/${selectedDay.add({ days }).toString()}`));
	}

	function getRelativeDayLabel(date: CalendarDate) {
		const todayDate = today(getLocalTimeZone());
		const daysDiff = date.compare(todayDate);

		if (daysDiff === 0) return m['foodDiary.headerToday']();
		if (daysDiff === -1) return m['foodDiary.yesterday']();
		if (daysDiff === 1) return m['foodDiary.tomorrow']();
		if (daysDiff < -1) return m['foodDiary.daysAgo']({ count: Math.abs(daysDiff) });
		if (daysDiff > 1) return m['foodDiary.inDays']({ count: daysDiff });
	}

	let weeklyCaloricChange = $derived(macroTargets.data?.weeklyCaloricChange ?? 0);

	// A day is finished once it is in the past; today is still in progress.
	let finished = $derived(selectedDay.compare(today(getLocalTimeZone())) < 0);

	let dailyNutritionStats = $derived.by(() => {
		if (!macroMetrics.data || macroTargets.data === undefined) return undefined;

		return calculateDailyNutritionStats({
			metrics: macroMetrics.data,
			weeklyCaloricChange,
			foodEntries,
			activityEntries
		});
	});
</script>

<div class="mb-2 flex flex-col gap-4">
	<div class="flex w-full">
		<Button size="icon-sm" variant="secondary" onclick={() => changeDay(-1)}>
			<ChevronLeftIcon />
		</Button>
		<div class="grid grow place-items-center">
			<Card.Title>{dateFormatter.format(selectedDay.toDate(timezone))}</Card.Title>
			<Card.Description class="text-xs">{getRelativeDayLabel(selectedDay)}</Card.Description>
		</div>
		<Button size="icon-sm" variant="secondary" onclick={() => changeDay(1)}>
			<ChevronRightIcon />
		</Button>
	</div>
	<!-- Reserves the bar's height so nothing shifts as data loads. -->
	<div class="flex min-h-14.5 w-full flex-col">
		{#if dailyNutritionStats}
			<StackedCaloriesBar
				day={selectedDay.toString()}
				{...dailyNutritionStats}
				{weeklyCaloricChange}
				{finished}
			/>
		{:else if macroTargets.isLoading || macroMetrics.isLoading}
			<Skeleton class="grow" />
		{:else}
			<a
				class="my-auto w-full py-3 text-center text-sm text-muted-foreground underline"
				href={resolve('food-diary/goals')}
			>
				{m['foodDiary.setCalorieGoal']()}
			</a>
		{/if}
	</div>
</div>
