<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { MacroTrackingMetricsSchema } from '$routes/(app)/food-diary/goals/metrics/_components/metrics-form-schema';
	import MetricsForm from '$routes/(app)/food-diary/goals/metrics/_components/metrics-form.svelte';
	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte';
	import { writable } from 'svelte/store';
	import { selectedStepsState } from '../../selected-steps.svelte';
	import { macroTrackingQuickstartState } from '../macro-tracking-quickstart-state.svelte';

	let formData = $state(writable<MacroTrackingMetricsSchema>());

	$effect(() => {
		if (macroTrackingQuickstartState.macroTrackingMetrics) {
			$formData = macroTrackingQuickstartState.macroTrackingMetrics;
		}
	});
</script>

<svelte:head>
	<meta name="required" content="true" />
	<meta
		name="description"
		content="Enter your weight, height, and other essentials to get started"
	/>
</svelte:head>

<MetricsForm
	bind:formData
	onUpdate={async ({ form }) => {
		if (!form.valid) return;
		macroTrackingQuickstartState.macroTrackingMetrics = form.data;
		await selectedStepsState.navigateToPage(page.url.pathname, 'next');
	}}
/>

<div class="mt-auto grid grid-cols-2 gap-2">
	<Button
		variant="secondary"
		onclick={() => selectedStepsState.navigateToPage(page.url.pathname, 'previous')}
	>
		<ChevronLeftIcon /> Previous
	</Button>
	<Button type="submit" form="macro-tracking-metrics-form">Next <ChevronRightIcon /></Button>
</div>
