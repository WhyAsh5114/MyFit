<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import type { HomePageCounts } from '../../+page.server';
	import ActionButtons from './ActionButtons.svelte';
	import CarouselComponent from './CarouselComponent.svelte';
	import Faq from './FAQ.svelte';
	import Features from './Features.svelte';
	import StatsComponent from './StatsComponent.svelte';

	let counts: HomePageCounts = $props();
</script>

<ScrollArea>
	<div class="my-12 grid h-fit grid-cols-2 place-items-center gap-x-2 gap-y-12 overflow-x-hidden">
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
		<Features />
		<Faq class="col-span-2" />
	</div>
</ScrollArea>
