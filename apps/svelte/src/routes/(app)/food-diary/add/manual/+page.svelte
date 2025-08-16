<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import H2 from '$lib/components/typography/h2.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { capitalizeWords, snakeToNormal } from '$lib/my-utils';
	import type { NutritionData } from '@prisma/client';
	import { PlusIcon } from '@lucide/svelte';

	let { data } = $props();
	let quantity = $state(100);

	const nutrimentLabels = getNutrimentLabels(data.sampleNutritionData);

	function getNutrimentLabels(sampleData: NutritionData) {
		const { code, product_name, brands, ...nutriments } = sampleData;
		const { energy_kcal_100g, proteins_100g, carbohydrates_100g, fat_100g, ...others } = nutriments;

		return Object.keys(others).map((key) => capitalizeWords(snakeToNormal(key).slice(0, -4)));
	}
</script>

<H1>Food diary</H1>
<H2 class="flex items-center justify-between">Add food</H2>

<form class="flex h-full flex-col gap-2">
	<div class="grid grid-cols-2 gap-2">
		<div class="col-span-2 flex w-full flex-col gap-1.5">
			<Label for="food-name">Name <span class="text-red-500">*</span></Label>
			<Input id="food-name" placeholder="Chicken sandwich" required />
		</div>
		<div class="flex w-full flex-col gap-1.5">
			<Label for="food-brands">Brand(s)</Label>
			<Input id="food-brands" placeholder="McDonald's" />
		</div>
		<div class="flex w-full flex-col gap-1.5">
			<Label for="food-quantity">Quantity (in grams) <span class="text-red-500">*</span></Label>
			<Input
				id="food-quantity"
				type="number"
				placeholder="100"
				required
				min={0}
				bind:value={quantity}
			/>
		</div>
	</div>
	<div class="flex items-center gap-2">
		<Separator class="w-px grow" />
		<span class="text-muted-foreground text-sm">Nutritional value per {quantity ?? '?'} grams</span>
		<Separator class="w-px grow" />
	</div>
	<ScrollArea class="bg-card h-px grow rounded-md border">
		<div class="grid grid-cols-2 place-items-end gap-4 p-4">
			<div class="flex w-full flex-col gap-1.5">
				<Label for="food-calories">Calories <span class="text-red-500">*</span></Label>
				<Input id="food-calories" type="number" placeholder="250" required min={0} step={0.01} />
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="food-protein">Protein (g) <span class="text-red-500">*</span></Label>
				<Input id="food-protein" type="number" placeholder="20" required min={0} step={0.01} />
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="food-fat">Fat (g) <span class="text-red-500">*</span></Label>
				<Input id="food-fat" type="number" placeholder="10" required min={0} step={0.01} />
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="food-carbs">Carbohydrates (g) <span class="text-red-500">*</span></Label>
				<Input id="food-carbs" type="number" placeholder="30" required min={0} step={0.01} />
			</div>
			{#each nutrimentLabels as nutrimentLabel (nutrimentLabel)}
				<div class="flex w-full flex-col gap-1.5">
					<Label for={`food-${nutrimentLabel.toLowerCase()}`}>{nutrimentLabel}</Label>
					<Input
						id={`food-${nutrimentLabel.toLowerCase()}`}
						type="number"
						placeholder="0"
						min={0}
						step={0.01}
					/>
				</div>
			{/each}
		</div>
	</ScrollArea>
	<Button type="submit">
		<PlusIcon /> Add food
	</Button>
</form>
