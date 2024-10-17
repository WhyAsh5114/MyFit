<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	export let sheetOpen: boolean | undefined = undefined;

	const linkItems: { text: string; href: string }[] = [
		{ text: 'Dashboard', href: '/dashboard' },
		{ text: 'Exercise splits', href: '/exercise-splits' },
		{ text: 'Mesocycles', href: '/mesocycles' },
		{ text: 'Workouts', href: '/workouts' },
		{ text: 'Donations', href: '/donations' },
		{ text: 'Privacy policy', href: '/privacy-policy' }
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
