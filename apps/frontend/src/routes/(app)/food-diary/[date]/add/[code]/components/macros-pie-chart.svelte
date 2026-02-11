<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { PieChart, Text } from 'layerchart';

	let {
		carbs,
		fats,
		proteins,
		kcal
	}: { carbs: number; fats: number; proteins: number; kcal: number } = $props();

	let chartData = $derived([
		{ macro: 'carbs', value: carbs, color: 'var(--chart-3)' },
		{ macro: 'fats', value: fats, color: 'var(--chart-2)' },
		{ macro: 'proteins', value: proteins, color: 'var(--chart-1)' }
	]);

	const chartConfig = {
		macro: { label: 'Macro' },
		carbs: { label: 'Carbs', color: 'var(--chart-3)' },
		fats: { label: 'Fats', color: 'var(--chart-2)' },
		proteins: { label: 'Proteins', color: 'var(--chart-1)' }
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
				dy={6}
			/>
			<Text
				value="kcal"
				textAnchor="middle"
				verticalAnchor="end"
				class="fill-muted-foreground! text-muted-foreground"
				dy={20}
			/>
		{/snippet}
		{#snippet tooltip()}
			<Chart.Tooltip hideLabel />
		{/snippet}
	</PieChart>
</Chart.Container>
