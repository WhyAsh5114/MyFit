<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { macrosFor } from '#lib/domain/nutrition/portion.js';
	import MacrosPieChart from './macros-pie-chart.svelte';
	import type { FoodEntryFormSchema } from '#lib/features/food-diary/food-entry/model/schema.js';

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

	let macros = $derived(macrosFor(food, quantityG));
	let energyKcal = $derived(macros.kcal);
	let carbs = $derived(macros.carbsG);
	let fat = $derived(macros.fatG);
	let protein = $derived(macros.proteinG);

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

<Card.Content class="flex flex-row items-center justify-around gap-4">
	<MacrosPieChart {carbs} {fat} {protein} kcal={energyKcal} />
	<div class="grid grow grid-cols-3">
		{@render macroCell(m['macro.carbs'](), carbs, 'text-chart-carbs', 4)}
		{@render macroCell(m['macro.fat'](), fat, 'text-chart-fat', 9)}
		{@render macroCell(m['macro.protein'](), protein, 'text-chart-protein', 4)}
	</div>
</Card.Content>
