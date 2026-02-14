<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { round } from '$lib/my-utils';
	import { BarChart } from 'layerchart';
	import { cubicInOut } from 'svelte/easing';

	type Props = {
		caloriesConsumed: number;
		caloriesRemaining: number;
		activityCalories: number;
		day: string;
	};
	let { caloriesConsumed, caloriesRemaining, activityCalories, day }: Props = $props();

	let chartData = $derived([
		{ day, consumed: caloriesConsumed, remaining: caloriesRemaining + activityCalories }
	]);

	const chartConfig = {
		consumed: { label: 'Consumed', color: 'var(--chart-consumed)' },
		remaining: { label: 'Remaining', color: 'var(--chart-remaining)' }
	} satisfies Chart.ChartConfig;
</script>

<div class="flex w-full flex-col items-center gap-0.5">
	<p class="text-sm font-medium">
		{round(caloriesConsumed, 0)} /
		<span class="text-xs font-normal">
			{round(caloriesRemaining + caloriesConsumed + activityCalories, 0)} kcal
		</span>
	</p>
	<Chart.Container config={chartConfig} class="h-4 w-full">
		<BarChart
			orientation="horizontal"
			data={chartData}
			y="day"
			padding={{ left: 0 }}
			axis="y"
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
		>
			{#snippet tooltip()}
				<Chart.Tooltip />
			{/snippet}
		</BarChart>
	</Chart.Container>
	<div class="flex w-full items-center justify-around gap-2 text-xs">
		<p>
			{round(caloriesRemaining + activityCalories, 0)} left (incl. {round(activityCalories, 0)} burned)
		</p>
	</div>
</div>
