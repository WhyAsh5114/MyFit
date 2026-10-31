<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import { cn } from '#lib/utils.js';
	import { PieChart, Text } from 'layerchart';
	import { hasCalculationErrors } from './common';

	let { carbs, fat, protein, kcal }: { carbs: number; fat: number; protein: number; kcal: number } =
		$props();

	let chartData = $derived([
		{ macro: 'carbs', value: carbs, color: 'var(--chart-carbs)' },
		{ macro: 'fat', value: fat, color: 'var(--chart-fat)' },
		{ macro: 'protein', value: protein, color: 'var(--chart-protein)' }
	]);

	const chartConfig = {
		macro: { label: 'Macro' },
		carbs: { label: m['macro.carbs'](), color: 'var(--chart-carbs)' },
		fat: { label: m['macro.fat'](), color: 'var(--chart-fat)' },
		protein: { label: m['macro.protein'](), color: 'var(--chart-protein)' }
	} satisfies Chart.ChartConfig;
</script>

<Chart.Container config={chartConfig} class="aspect-square h-18">
	<PieChart
		data={chartData}
		key="macro"
		value="value"
		c="color"
		innerRadius={36}
		padding={6}
		props={{ pie: { motion: 'tween' } }}
	>
		{#snippet aboveMarks()}
			<Text
				value={Math.round(kcal).toString()}
				textAnchor="middle"
				verticalAnchor="end"
				class="fill-foreground text-lg! font-bold"
			/>
			<Text
				value="kcal"
				textAnchor="middle"
				verticalAnchor="end"
				class={cn('fill-muted-foreground! text-muted-foreground', {
					'fill-warning!': hasCalculationErrors(kcal, carbs, protein, fat)
				})}
				dy={14}
			/>
		{/snippet}
		{#snippet tooltip()}
			<Chart.Tooltip hideLabel />
		{/snippet}
	</PieChart>
</Chart.Container>
