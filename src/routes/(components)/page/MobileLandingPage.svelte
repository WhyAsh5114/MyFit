<script lang="ts">
	import type { HomePageCounts } from '../../+page.server';
	import ActionButtons from './ActionButtons.svelte';
	import CarouselComponent from './CarouselComponent.svelte';
	import Faq from './FAQ.svelte';
	import StatsComponent from './StatsComponent.svelte';

	let counts: HomePageCounts = $props();
</script>

<div class="flex flex-col justify-evenly gap-6 px-4">
	<span class="text-center text-3xl font-bold">
		Free <span class="text-primary">science-based</span> workout tracking
	</span>
	<span class="text-md text-center leading-tight text-muted-foreground">
		With automatic progression, detailed statistics, and highly customizable
	</span>
	<CarouselComponent />
	<StatsComponent {...counts} />
	<ActionButtons />
	<Faq />
</div>
