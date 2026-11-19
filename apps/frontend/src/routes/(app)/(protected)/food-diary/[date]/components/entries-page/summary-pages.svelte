<script lang="ts">
	import * as Carousel from '#lib/components/ui/carousel/index.js';
	import type { CarouselAPI } from '#lib/components/ui/carousel/context.js';
	import type { Snippet } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';

	type Props = {
		/** Names the pager for screen readers. */
		label: string;
		/** Each page's name labels its dot. */
		pages: { label: string; content: Snippet }[];
	};
	let { label, pages }: Props = $props();

	let carousel = $state<CarouselAPI>();
	let page = $state(0);

	// Embla's duration is a physics constant, not milliseconds: its default of 25 settles in about
	// 600 ms, and 14 in about 250 ms, inside the 200–300 ms DESIGN.md gives transitions like this.
	const SLIDE_DURATION = 14;

	// Swiping moves the carousel itself, so the dots follow embla's selection.
	$effect(() => {
		const api = carousel;
		if (!api) return;
		const select = () => (page = api.selectedScrollSnap());
		// A swipe's release ignores the `duration` option and uses embla's own, slower speed, which
		// the engine sets just before `pointerUp`. Reduced motion snaps to the page instead.
		const release = () =>
			api
				.internalEngine()
				.scrollBody.useDuration(prefersReducedMotion.current ? 0 : SLIDE_DURATION);
		api.on('select', select);
		api.on('pointerUp', release);
		return () => {
			api.off('select', select);
			api.off('pointerUp', release);
		};
	});

	function showPage(index: number) {
		carousel?.scrollTo(index, prefersReducedMotion.current);
	}
</script>

<!-- Swipe is a shortcut; the dots are buttons, so a tap reaches every page too. -->
<Carousel.Root
	opts={{ duration: SLIDE_DURATION }}
	setApi={(api) => (carousel = api)}
	aria-label={label}
>
	<Carousel.Content>
		{#each pages as item (item.label)}
			<Carousel.Item class="flex items-center" aria-label={item.label}>
				{@render item.content()}
			</Carousel.Item>
		{/each}
	</Carousel.Content>
</Carousel.Root>
<div class="flex justify-center" role="group" aria-label={label}>
	{#each pages as item, index (item.label)}
		<button
			type="button"
			class="group tap relative grid h-6 w-11 place-items-center"
			aria-label={item.label}
			aria-current={page === index}
			onclick={() => showPage(index)}
		>
			<span
				class="h-1.5 w-1.5 rounded-full bg-input transition-[width] duration-150 ease-out group-aria-current:w-5 group-aria-current:bg-foreground motion-reduce:transition-none"
			></span>
		</button>
	{/each}
</div>
