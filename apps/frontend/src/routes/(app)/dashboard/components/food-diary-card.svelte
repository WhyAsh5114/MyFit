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
			{m['foodDiary.notes.formLabel']()}
		</Card.Description>
	</Card.Header>
	<Card.Content class="prose prose-sm dark:prose-invert">
		<ul>
			<li>{m['foodDiary.notes.healthConnect']()}</li>
			<li>{m['foodDiary.notes.database']()}</li>
			<li>{m['foodDiary.notes.barcode']()}</li>
		</ul>
	</Card.Content>
	<Card.Footer>
		<Button class="ml-auto" href="/food-diary">
			{m['nav.foodDiary']()}
			<AppleIcon />
		</Button>
	</Card.Footer>
</Card.Root>
