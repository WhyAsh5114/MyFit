<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, ScanBarcodeIcon } from '@lucide/svelte';
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
				Set calorie goal →
			</a>
		{/if}
	</Card.Header>
</Card.Root>

<div class="grid grid-cols-2 gap-2">
	<Button href={resolve(`/food-diary/${selectedDay.toString()}/add`)} variant="secondary">
		<PlusIcon />
		{m['foodDiary.addFood']()}
	</Button>

	<Button href={resolve(`/food-diary/${selectedDay.toString()}/add/scan`)}>
		<ScanBarcodeIcon />
		{m['foodDiary.scanBarcode']()}
	</Button>
</div>
