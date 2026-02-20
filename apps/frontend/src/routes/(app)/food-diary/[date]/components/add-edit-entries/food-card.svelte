<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import MacrosPieChart from './macros-pie-chart.svelte';
	import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/food-entry.schema';

	type Props = {
		food: Pick<
			FoodEntryFormSchema,
			| 'productName'
			| 'brands'
			| 'energyKcal_100g'
			| 'carbohydratesG_100g'
			| 'fatG_100g'
			| 'proteinsG_100g'
		>;
		quantityG: number;
	};
	let { food, quantityG }: Props = $props();

	let energyKcal = $derived(food.energyKcal_100g * (quantityG / 100));
	let carbs = $derived(food.carbohydratesG_100g * (quantityG / 100));
	let fat = $derived(food.fatG_100g * (quantityG / 100));
	let protein = $derived(food.proteinsG_100g * (quantityG / 100));

	function calculateMacroPercentage(macroGrams: number, kcalPerGram: number) {
		const macroKcal = macroGrams * kcalPerGram;
		const totalKcal = carbs * 4 + fat * 9 + protein * 4;
		return totalKcal > 0 ? (macroKcal / totalKcal) * 100 : 0;
	}

	function formatGrams(value: number) {
		return value.toFixed() + 'g';
	}
</script>

{#snippet macroCell(macro: string, value: number, color: string, multiplier: number)}
	<div class="flex flex-col items-center justify-center">
		<span class="text-xs {color}">
			{Math.round(calculateMacroPercentage(value, multiplier))}%
		</span>
		<span class="text-sm">{formatGrams(value)}</span>
		<span class="text-xs text-muted-foreground">{macro}</span>
	</div>
{/snippet}

<Card.Content class="flex items-center justify-around gap-4">
	<MacrosPieChart {carbs} {fat} {protein} kcal={energyKcal} />
	<div class="grid grow grid-cols-3">
		{@render macroCell('Carbs', carbs, 'text-chart-carbs', 4)}
		{@render macroCell('Fat', fat, 'text-chart-fat', 9)}
		{@render macroCell('Protein', protein, 'text-chart-protein', 4)}
	</div>
</Card.Content>
