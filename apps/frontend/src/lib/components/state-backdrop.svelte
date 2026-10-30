<script lang="ts">
	// Unsplash photos (free to use, no attribution needed), bundled so they work offline.
	import forest from '#lib/assets/backdrops/forest.webp';
	import gym from '#lib/assets/backdrops/gym.webp';
	import meal from '#lib/assets/backdrops/meal.webp';
	import salad from '#lib/assets/backdrops/salad.webp';
	import sunset from '#lib/assets/backdrops/sunset.webp';

	const SCENES = { forest, gym, meal, salad, sunset };

	let { scene }: { scene: keyof typeof SCENES } = $props();
</script>

<!-- A dimmed black-and-white photo behind the full-screen account states, like the login page's. -->
<div aria-hidden="true" class="pointer-events-none fixed inset-0 bg-muted">
	<img src={SCENES[scene]} alt="" class="size-full object-cover brightness-50" />
</div>
