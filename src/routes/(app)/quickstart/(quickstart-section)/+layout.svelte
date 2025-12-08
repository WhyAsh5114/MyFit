<script lang="ts">
	import { page } from '$app/state';
	import CircularProgressBar from '$lib/components/magicui/circular-progress-bar.svelte';
	import H1 from '$lib/components/typography/h1.svelte';
	import H2 from '$lib/components/typography/h2.svelte';
	import { kebabToNormal } from '$lib/my-utils';
	import { Spring } from 'svelte/motion';
	import { selectedStepsState } from './selected-steps.svelte';
	import H3 from '$lib/components/typography/h3.svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let { children } = $props();
	let progressValue = new Spring(0, { stiffness: 0.3, damping: 0.9 });

	$effect(() => {
		if (!page.data.stepRoutesMap) return;
		const value = selectedStepsState.selectedSteps.findIndex(
			(route) => route === page.url.pathname
		);
		progressValue.set(isNaN(value) ? 0 : value);
	});

	$effect(() => {
		if (page.url.pathname.split('/').length === 3) return;

		if (selectedStepsState.selectedSteps.length === 0) {
			toast.error('No steps selected');
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(page.url.pathname.split('/').slice(0, -1).join('/'));
		}
	});
</script>

<H1>Quickstart</H1>
<H2 class="flex items-center justify-between gap-2">
	{kebabToNormal(page.url.pathname.split('/')[2])}
	{#key progressValue.current}
		{#if page.url.pathname.split('/').length > 3}
			<CircularProgressBar
				class="text-background/0 size-8"
				max={selectedStepsState.selectedSteps.length}
				min={0}
				value={progressValue.current}
				gaugePrimaryColor="hsl(var(--primary))"
				gaugeSecondaryColor="hsl(var(--muted))"
			/>
		{/if}
	{/key}
</H2>

{#if page.url.pathname.split('/').length > 3}
	<H3>{kebabToNormal(page.url.pathname.split('/')[3].slice(2))}</H3>
{/if}

{@render children()}
