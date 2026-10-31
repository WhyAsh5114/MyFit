<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import { calorieStatus, goalDirection } from '#lib/domain/nutrition/status.js';
	import { m } from '#lib/paraglide/messages.js';
	import { formatNumber } from '#lib/my-utils.js';
	import { cn } from '#lib/utils.js';
	import { ArrowDownIcon, ArrowUpIcon, CheckIcon, PencilIcon } from '@lucide/svelte';
	import { BarChart } from 'layerchart';
	import { cubicInOut } from 'svelte/easing';

	type Props = {
		caloriesConsumed: number;
		caloriesRemaining: number;
		caloriesBurned: number;
		weeklyCaloricChange: number;
		/** A finished day is judged; today only reports what is already certain. */
		finished: boolean;
		day: string;
	};
	let {
		caloriesConsumed,
		caloriesRemaining,
		caloriesBurned,
		weeklyCaloricChange,
		finished,
		day
	}: Props = $props();

	// The remaining calories already include what was burned, so this is the day's allowance.
	let target = $derived(caloriesConsumed + caloriesRemaining);
	let over = $derived(caloriesRemaining < 0);

	let status = $derived(
		calorieStatus({
			consumed: caloriesConsumed,
			target,
			goal: goalDirection(weeklyCaloricChange),
			finished
		})
	);
	let flagged = $derived(status.kind === 'off-target');

	let chartData = $derived.by(() => {
		if (!over) {
			return [
				{
					day,
					consumed: (caloriesConsumed / target) * 100,
					remaining: (caloriesRemaining / target) * 100,
					excess: 0
				}
			];
		}

		// Past the target, the bar is scaled to what was eaten and the overage is its own segment.
		return [
			{
				day,
				consumed: (target / caloriesConsumed) * 100,
				remaining: 0,
				excess: ((caloriesConsumed - target) / caloriesConsumed) * 100
			}
		];
	});

	/** Where the goal sits on the bar once it has been passed. */
	let goalTick = $derived(over && caloriesConsumed > 0 ? (target / caloriesConsumed) * 100 : null);

	// Amber only when the day is actually off target, not for every bit of overage.
	let chartConfig = $derived({
		consumed: { label: 'Consumed', color: 'var(--chart-consumed)' },
		remaining: { label: 'Remaining', color: 'var(--chart-remaining)' },
		excess: { label: 'Excess', color: flagged ? 'var(--warning)' : 'var(--chart-consumed)' }
	} satisfies Chart.ChartConfig);
</script>

<div class="flex w-full flex-col items-center gap-1">
	<div class="flex w-full justify-between gap-3">
		<div class="flex flex-col items-start gap-0.5 text-xs">
			<p class="text-sm font-medium tabular-nums">
				{m['foodDiary.caloriesOfTarget']({
					consumed: formatNumber(caloriesConsumed),
					target: formatNumber(target)
				})}
			</p>
			<p
				class={cn(
					'flex items-center gap-1 tabular-nums',
					flagged && 'font-medium text-warning-ink',
					status.kind === 'on-target' && 'font-medium text-success-ink',
					status.kind === 'neutral' && 'text-muted-foreground'
				)}
			>
				{#if status.kind === 'on-target'}
					<CheckIcon class="size-3.5" />
				{:else if status.kind === 'off-target'}
					{#if status.direction === 'over'}
						<ArrowUpIcon class="size-3.5" />
					{:else}
						<ArrowDownIcon class="size-3.5" />
					{/if}
				{/if}
				{over
					? m['foodDiary.kcalOver']({ amount: formatNumber(Math.abs(caloriesRemaining)) })
					: m['foodDiary.kcalLeft']({ amount: formatNumber(caloriesRemaining) })}
				{#if caloriesBurned > 0}
					({m['foodDiary.includingBurned']({ amount: formatNumber(caloriesBurned) })})
				{/if}
			</p>
		</div>
		<Button size="sm" variant="outline" href="/food-diary/goals" class="shrink-0">
			{m['foodDiary.editGoal']()}
			<PencilIcon class="size-4" />
		</Button>
	</div>
	<div class="relative w-full">
		<Chart.Container config={chartConfig} class="h-4 w-full">
			<BarChart
				orientation="horizontal"
				data={chartData}
				y="day"
				xDomain={[0, 100]}
				padding={0}
				axis="y"
				tooltipContext={false}
				series={[
					{
						key: 'consumed',
						label: 'Consumed',
						color: chartConfig.consumed.color,
						props: { rounded: 'none' }
					},
					{
						key: 'remaining',
						label: 'Remaining',
						color: chartConfig.remaining.color,
						props: { rounded: 'none' }
					},
					{
						key: 'excess',
						label: 'Excess',
						color: chartConfig.excess.color,
						props: { rounded: 'none' }
					}
				]}
				seriesLayout="stack"
				props={{
					bars: {
						stroke: 'none',
						initialX: 0,
						initialWidth: 0,
						motion: {
							x: { type: 'tween', duration: 250, easing: cubicInOut },
							width: { type: 'tween', duration: 250, easing: cubicInOut }
						}
					},
					yAxis: { hidden: true },
					grid: { x: false }
				}}
			/>
		</Chart.Container>
		{#if goalTick !== null}
			<!-- Marks the goal once it has been passed. -->
			<div
				class="pointer-events-none absolute -inset-y-0.5 w-0.5 rounded-full bg-foreground"
				style="left: calc({goalTick}% - 1px)"
			></div>
		{/if}
	</div>
</div>
