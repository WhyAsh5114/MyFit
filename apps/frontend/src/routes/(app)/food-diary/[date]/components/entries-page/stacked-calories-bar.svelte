<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { round } from '$lib/my-utils';
	import { ChevronRightIcon } from '@lucide/svelte';
	import { BarChart } from 'layerchart';
	import { cubicInOut } from 'svelte/easing';

	type Props = {
		caloriesConsumed: number;
		caloriesRemaining: number;
		caloriesBurned: number;
		day: string;
	};
	let { caloriesConsumed, caloriesRemaining, caloriesBurned, day }: Props = $props();

	let chartData = $derived.by(() => {
		const remaining = caloriesRemaining;

		if (remaining > 0) {
			const total = caloriesConsumed + remaining;
			return [
				{
					day,
					consumed: (caloriesConsumed / total) * 100,
					remaining: (remaining / total) * 100,
					excess: 0
				}
			];
		}

		// If the remaining calories are negative, we show the overconsumption in red as "excess"
		const total = caloriesConsumed;
		return [
			{
				day,
				consumed: ((caloriesConsumed - Math.abs(remaining)) / total) * 100,
				remaining: 0,
				excess: (Math.abs(remaining) / total) * 100
			}
		];
	});

	const chartConfig = {
		consumed: { label: 'Consumed', color: 'var(--chart-consumed)' },
		remaining: { label: 'Remaining', color: 'var(--chart-remaining)' },
		excess: { label: 'Excess', color: 'var(--warning)' }
	} satisfies Chart.ChartConfig;
</script>

<div class="flex w-full flex-col items-center">
	<div class="flex w-full justify-between">
		<div class="flex w-full flex-col items-start text-xs">
			<p class="text-sm font-medium">
				{round(caloriesConsumed, 0)} /
				{round(caloriesRemaining + caloriesConsumed + caloriesBurned, 0)} kcal
			</p>
			<p class={caloriesRemaining < 0 ? 'text-warning' : 'text-muted-foreground'}>
				{Math.abs(round(caloriesRemaining + caloriesBurned, 0))} kcal
				{caloriesRemaining < 0 ? 'over' : 'left'}
				{caloriesBurned > 0 ? `(incl. ${round(caloriesBurned, 0)} burned)` : ''}
			</p>
		</div>	
		<p class="flex items-center gap-2 text-sm whitespace-nowrap text-muted-foreground h-fit">
			Edit goal <ChevronRightIcon class="size-4" />
		</p>
	</div>
	<Chart.Container config={chartConfig} class="h-4 w-full">
		<BarChart
			orientation="horizontal"
			data={chartData}
			y="day"
			xDomain={[0, 100]}
			padding={0}
			axis="y"
			tooltip={false}
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
</div>
