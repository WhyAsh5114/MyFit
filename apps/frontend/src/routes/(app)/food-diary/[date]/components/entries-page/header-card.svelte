<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte';
	import { dateFormatter } from '$lib/my-utils';
	import { useCurrentUser } from '$lib/features/user/queries/get-current-user';
	import { calculateDailyNutritionStats } from '$lib/domain/nutrition/stats';
	import type { ActivityEntry, FoodEntry } from '@myfit/api/prisma/client';
	import StackedCaloriesBar from './stacked-calories-bar.svelte';
	import { useMacroMetricsByDate } from '$lib/features/food-diary/macro-metrics/queries/get-by-date';
	import { useMacroTargetsByDate } from '$lib/features/food-diary/macro-targets/queries/get-by-date';

	type Props = {
		foodEntries?: FoodEntry[];
		activityEntries?: ActivityEntry[];
		selectedDay: CalendarDate;
		timezone: string;
	};
	let { foodEntries, activityEntries, selectedDay, timezone }: Props = $props();

	const currentUser = useCurrentUser();
	const macroMetrics = useMacroMetricsByDate(() => ({
		userId: currentUser.data?.id ?? '',
		date: selectedDay
	}));
	const macroTargets = useMacroTargetsByDate(() => ({
		userId: currentUser.data?.id ?? '',
		date: selectedDay
	}));

	function changeDay(days: number) {
		selectedDay = selectedDay.add({ days });
		goto(resolve(`/food-diary/${selectedDay.toString()}`));
	}

	function getRelativeDayLabel(date: CalendarDate) {
		const todayDate = today(getLocalTimeZone());
		const daysDiff = date.compare(todayDate);

		if (daysDiff === 0) return 'Today';
		if (daysDiff === -1) return 'Yesterday';
		if (daysDiff === 1) return 'Tomorrow';
		if (daysDiff < -1) return `${Math.abs(daysDiff)} days ago`;
		if (daysDiff > 1) return `In ${daysDiff} days`;
	}

	let dailyNutritionStats = $derived.by(() => {
		if (!macroMetrics.data || macroTargets.data === undefined) return undefined;

		const weeklyCaloricChange = macroTargets.data?.weeklyCaloricChange ?? 0;
		return calculateDailyNutritionStats({
			metrics: macroMetrics.data,
			weeklyCaloricChange,
			foodEntries,
			activityEntries
		});
	});
</script>

<div class="flex min-h-13 flex-col gap-4">
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
	{#if dailyNutritionStats}
		<a class="w-full" href={resolve(`/food-diary/goals`)}>
			<StackedCaloriesBar day={selectedDay.toString()} {...dailyNutritionStats} />
		</a>
	{:else}
		<a
			class="w-full text-center text-sm text-muted-foreground underline"
			href={resolve('/food-diary/goals')}
		>
			Set calorie goal →
		</a>
	{/if}
</div>
