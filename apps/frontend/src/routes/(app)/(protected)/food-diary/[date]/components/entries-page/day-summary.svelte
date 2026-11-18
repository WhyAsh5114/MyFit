<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Progress } from '#lib/components/ui/progress/index.js';
	import { resolve } from '$app/paths';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import type { Row } from '@myfit/shared/client';
	import { BotMessageSquareIcon, PencilIcon } from '@lucide/svelte';
	import { calculateDailyNutritionStats } from '#lib/domain/nutrition/stats.js';
	import {
		calorieStatus,
		goalDirection,
		type NutritionStatus
	} from '#lib/domain/nutrition/status.js';
	import { totalMacros } from '#lib/domain/nutrition/portion.js';
	import { macroGramTargets } from '#lib/domain/nutrition/macro-targets.js';
	import { formatNumber } from '#lib/format.js';
	import { m } from '#lib/paraglide/messages.js';
	import { cn } from '#lib/utils.js';
	import CalorieGauge from './calorie-gauge.svelte';

	type Props = {
		foodEntries?: Row<'FoodEntry'>[];
		activityEntries?: Row<'ActivityEntry'>[];
		selectedDay: CalendarDate;
		macroMetrics: Row<'MacroMetrics'> | null;
		macroTargets: Row<'MacroTargets'> | null;
	};
	let { foodEntries, activityEntries, selectedDay, macroMetrics, macroTargets }: Props = $props();

	let weeklyCaloricChange = $derived(macroTargets?.weeklyCaloricChange ?? 0);

	// A day is finished once it is in the past; today is still in progress.
	let finished = $derived(selectedDay.compare(today(getLocalTimeZone())) < 0);

	// Null until the body metrics for a calorie goal are set.
	let stats = $derived(
		macroMetrics
			? calculateDailyNutritionStats({
					metrics: macroMetrics,
					weeklyCaloricChange,
					foodEntries,
					activityEntries
				})
			: null
	);

	let eaten = $derived(totalMacros(foodEntries ?? []));
	// The remaining calories already include what was burned, so this is the day's allowance.
	let target = $derived(stats ? stats.caloriesConsumed + stats.caloriesRemaining : null);

	let status: NutritionStatus = $derived(
		target === null
			? { kind: 'neutral' }
			: calorieStatus({
					consumed: eaten.kcal,
					target,
					goal: goalDirection(weeklyCaloricChange),
					finished
				})
	);

	// Every row shows, goal or not, so the summary keeps its height; a row without a target has an
	// empty bar.
	let rows = $derived.by(() => {
		const targets = macroGramTargets(macroTargets, target);
		return [
			{ key: 'calories', label: m['foodDiary.calories'](), amount: eaten.kcal, target, kcal: true },
			{ key: 'carbs', label: m['macro.carbs'](), amount: eaten.carbsG, target: targets.carbsG },
			{ key: 'fat', label: m['macro.fat'](), amount: eaten.fatG, target: targets.fatG },
			{
				key: 'protein',
				label: m['macro.protein'](),
				amount: eaten.proteinG,
				target: targets.proteinG
			}
		] as const;
	});

	// Amber only when the day is actually off target, not for every bit of overage.
	let caloriesFlagged = $derived(status.kind === 'off-target' && status.direction === 'over');

	// Full class names, so Tailwind finds them.
	const dotColor = {
		calories: 'bg-chart-consumed',
		carbs: 'bg-chart-carbs',
		fat: 'bg-chart-fat',
		protein: 'bg-chart-protein'
	};
	const barColor = {
		calories: '*:data-[slot=progress-indicator]:bg-chart-consumed',
		carbs: '*:data-[slot=progress-indicator]:bg-chart-carbs',
		fat: '*:data-[slot=progress-indicator]:bg-chart-fat',
		protein: '*:data-[slot=progress-indicator]:bg-chart-protein'
	};

	function unit(row: (typeof rows)[number]) {
		const kcal = 'kcal' in row;
		if (row.target === null) return kcal ? m['foodDiary.kcalUnit']() : m['foodDiary.macroGrams']();
		const goal = formatNumber(row.target);
		return kcal
			? m['foodDiary.caloriesOfGoal']({ target: goal })
			: m['foodDiary.macroOfTarget']({ target: goal });
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center gap-4">
		<CalorieGauge
			consumed={eaten.kcal}
			{target}
			burned={stats?.caloriesBurned ?? 0}
			{eaten}
			{status}
		/>
		<div class="flex min-w-0 grow flex-col gap-2.5">
			{#each rows as row (row.key)}
				<div class="flex flex-col gap-1">
					<div class="flex flex-wrap items-baseline justify-between gap-x-2 text-xs">
						<span class="flex items-center gap-1.5 text-muted-foreground">
							<span class={cn('size-2 shrink-0 rounded-[2px]', dotColor[row.key])}></span>
							{row.label}
						</span>
						<span class="tabular-nums">
							{formatNumber(row.amount)}<span class="text-muted-foreground">{unit(row)}</span>
						</span>
					</div>
					<Progress
						value={row.target === null ? 0 : Math.min(row.amount, row.target)}
						max={row.target || 1}
						class={cn(
							'h-1.5',
							row.key === 'calories' && caloriesFlagged
								? '*:data-[slot=progress-indicator]:bg-warning'
								: barColor[row.key]
						)}
						aria-label={row.label}
					/>
				</div>
			{/each}
		</div>
	</div>

	<!-- The day's actions sit between its summary and its meals, like Add manually and Scan barcode on Add food. -->
	<div class="grid grid-cols-2 gap-2">
		<Button variant="secondary" href={resolve('food-diary/goals')}>
			<PencilIcon />{stats ? m['foodDiary.editGoal']() : m['foodDiary.setGoal']()}
		</Button>
		<Button href={resolve('chat')}>
			{m['foodDiary.logWithChat']()}<BotMessageSquareIcon />
		</Button>
	</div>
</div>
