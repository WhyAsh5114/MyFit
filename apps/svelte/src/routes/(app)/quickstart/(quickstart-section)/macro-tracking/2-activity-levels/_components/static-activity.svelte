<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { STATIC_ACTIVITY_LEVELS } from '$lib/constants';
	import { kebabToNormal } from '$lib/my-utils';

	let caloricValue = $state(150);
	let closestActivityLevel = $derived.by(() => {
		return STATIC_ACTIVITY_LEVELS.reduce((prev, curr) => {
			return Math.abs(curr.extraCalories - caloricValue) <
				Math.abs(prev.extraCalories - caloricValue)
				? curr
				: prev;
		});
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Static activity</Card.Title>
		<Card.Description>
			Select your activity level to get a more accurate total daily energy expenditure (TDEE)
			estimate
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<Slider
			type="single"
			max={1000}
			step={50}
			min={0}
			bind:value={caloricValue}
			id="static-activity-adjustment-calories"
		/>
		<div class="bg-background mt-4 flex flex-col items-center rounded-md border p-4">
			<span class="mb-2 text-lg font-semibold">+{caloricValue} kcal</span>
			<span>{kebabToNormal(closestActivityLevel.value)}</span>
			<p class="text-muted-foreground text-center text-sm">{closestActivityLevel.description}</p>
		</div>
	</Card.Content>
</Card.Root>
