<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	export let sheetOpen: boolean | undefined = undefined;

	const linkItems: { text: string; href: string }[] = [
		{ text: 'Workouts', href: '/workouts' },
		{ text: 'Mesocycles', href: '/mesocycles' },
		{ text: 'Exercise splits', href: '/exercise-splits' },
		{ text: 'Privacy policy', href: '/privacy-policy' },
		{ text: 'Donations', href: '/donations' }
	];
</script>

<ul class="mb-auto lg:mt-8">
	{#each linkItems as { text, href }}
		<li>
			<Button class="text-foreground lg:text-base" {href} onclick={() => (sheetOpen = false)} variant="link">
				{text}
			</Button>
		</li>
	{/each}
</ul>
