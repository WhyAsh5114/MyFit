<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	export let sheetOpen: boolean | undefined = undefined;

	const linkItems: { text: string; href: string }[] = [
		{ text: 'Workouts', href: '/workouts' },
		{ text: 'Mesocycles', href: '/mesocycles' },
		{ text: 'Exercise splits', href: '/exercise-splits' },
		{ text: 'Privacy policy', href: '/privacy-policy' }
	];
</script>

<ul class="mb-auto lg:mt-8">
	{#each linkItems as { text, href }}
		<li>
			<Button
				variant="link"
				class="text-foreground lg:text-base"
				onclick={() => (sheetOpen = false)}
			>
				<a {href}>{text}</a>
			</Button>
		</li>
	{/each}
</ul>
