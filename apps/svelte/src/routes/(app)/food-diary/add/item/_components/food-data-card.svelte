<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import type { NutritionData } from '@prisma/client';
	import { PieChart, Text } from 'layerchart';

	type PropsType = Omit<NutritionData, 'code'> & { code: string; userQuantity: number };

	let {
		energy_kcal_100g,
		proteins_100g,
		carbohydrates_100g,
		fat_100g,
		product_name,
		brands,
		userQuantity
	}: PropsType = $props();

	const chartData = [
		{
			macro: 'Carbs',
			value: carbohydrates_100g,
			perc: getPercentageOfCalories('Carbs', carbohydrates_100g),
			color: '#00DDDD'
		},
		{
			macro: 'Fats',
			value: fat_100g,
			perc: getPercentageOfCalories('Fats', fat_100g),
			color: '#AC6AC7'
		},
		{
			macro: 'Protein',
			value: proteins_100g,
			perc: getPercentageOfCalories('Protein', proteins_100g),
			color: '#FFCE56'
		}
	];

	const chartConfig = {
		Carbs: { label: 'Carbs', color: 'var(--chart-1)' },
		Fats: { label: 'Fats', color: 'var(--chart-2)' },
		Protein: { label: 'Protein', color: 'var(--chart-3)' }
	} satisfies Chart.ChartConfig;

	function getPercentageOfCalories(macro: string, value: number): number {
		if (macro !== 'Carbs' && macro !== 'Fats' && macro !== 'Protein') {
			throw new Error(`Invalid macro type: ${macro}`);
		}
		const caloriesPerGram = { Carbs: 4, Fats: 9, Protein: 4 };
		return ((Number(value) * caloriesPerGram[macro]) / Number(energy_kcal_100g)) * 100;
	}
</script>

<Card.Root class="flex h-full w-full flex-col">
	<Card.Header>
		<Card.Title>
			{product_name}
		</Card.Title>
		<Card.Description class="text-muted-foreground text-sm">
			{brands ? brands.split(',').join(', ') : 'Unknown brand'}
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-row items-center justify-between">
		<Chart.Container config={chartConfig} class="aspect-square h-16">
			<PieChart
				data={chartData}
				key="macro"
				value="perc"
				c="color"
				innerRadius={36}
				props={{ pie: { motion: 'tween' } }}
			>
				{#snippet aboveMarks()}
					<Text
						value={(Number(energy_kcal_100g) * (userQuantity / 100)).toFixed()}
						textAnchor="middle"
						verticalAnchor="middle"
						class="fill-foreground text-lg! font-bold"
						dy={-6}
					/>
					<Text
						value="kcal"
						textAnchor="middle"
						verticalAnchor="middle"
						class="fill-muted-foreground! text-muted-foreground"
						dy={10}
					/>
				{/snippet}
				{#snippet tooltip()}
					<Chart.Tooltip hideLabel />
				{/snippet}
			</PieChart>
		</Chart.Container>
		{#each chartData as { macro, perc, value, color } (macro)}
			<div class="flex flex-col items-center gap-0.5">
				<span class="text-xs" style="color: {color}">{perc.toFixed()}%</span>
				<span class="font-medium">{(Number(value) * (userQuantity / 100)).toFixed(1)}g</span>
				<span class="text-xs">{macro}</span>
			</div>
		{/each}
	</Card.Content>
</Card.Root>
