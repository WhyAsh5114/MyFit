<script lang="ts">
	import type { HomePageCounts } from '../../+page.server';
	import ActionButtons from './ActionButtons.svelte';
	import CarouselComponent from './CarouselComponent.svelte';
	import StatsComponent from './StatsComponent.svelte';

	let counts: HomePageCounts = $props();
</script>

<div class="grid h-fit grid-cols-2 place-items-center gap-2">
	<div class="my-auto flex flex-col gap-6">
		<span class="text-3xl font-bold">
			Free <span class="text-primary">science-based</span> workout tracking
		</span>
		<span class="text-md leading-tight text-muted-foreground">
			With automatic progression, detailed statistics, and highly customizable
		</span>
	</div>
	<CarouselComponent />
	<StatsComponent {...counts} />
	<ActionButtons />
</div>
