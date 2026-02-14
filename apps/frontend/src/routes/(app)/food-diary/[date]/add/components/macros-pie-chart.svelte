<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { cn } from '$lib/utils';
	import { PieChart, Text } from 'layerchart';

	let { carbs, fat, protein, kcal }: { carbs: number; fat: number; protein: number; kcal: number } =
		$props();

	let chartData = $derived([
		{ macro: 'carbs', value: carbs, color: 'var(--chart-3)' },
		{ macro: 'fat', value: fat, color: 'var(--chart-2)' },
		{ macro: 'protein', value: protein, color: 'var(--chart-1)' }
	]);

	const chartConfig = {
		macro: { label: 'Macro' },
		carbs: { label: 'Carbs', color: 'var(--chart-3)' },
		fat: { label: 'Fat', color: 'var(--chart-2)' },
		protein: { label: 'Protein', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;

	let hasCalculationErrors = $derived.by(() => {
		const totalKcal = carbs * 4 + fat * 9 + protein * 4;
		return Math.abs(totalKcal - kcal) > 0.1 * kcal; // allow 10% error margin
	});
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
				class={cn('fill-muted-foreground! text-muted-foreground', {
					'fill-warning!': hasCalculationErrors
				})}
				dy={20}
			/>
		{/snippet}
		{#snippet tooltip()}
			<Chart.Tooltip hideLabel />
		{/snippet}
	</PieChart>
</Chart.Container>
