<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { m } from '$lib/paraglide/messages';
	import { AppleIcon } from '@lucide/svelte';
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{m['nav.foodDiary']()}</Card.Title>
		<Card.Description>
			The first feature we're working on is the food diary. This will allow you to track your meals
			and calories throughout the day.
		</Card.Description>
	</Card.Header>
	<Card.Content class="prose prose-sm dark:prose-invert">
		<ul>
			<li>Syncs activity with Android <b>HealthConnect</b> and Apple <b>HealthKit</b></li>
			<li>Large database of foods and nutrition information</li>
			<li>Support for barcode scanning</li>
		</ul>
	</Card.Content>
	<Card.Footer>
		<Button class="ml-auto" href="/food-diary">
			{m['nav.foodDiary']()}
			<AppleIcon />
		</Button>
	</Card.Footer>
</Card.Root>
