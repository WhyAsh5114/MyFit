<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import type { ActivityAdjustmentType } from '@prisma/client';
	import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { selectedStepsState } from '../../selected-steps.svelte';
	import { macroTrackingQuickstartState } from '../macro-tracking-quickstart-state.svelte';
	import DynamicActivity from './_components/dynamic-activity.svelte';
	import ManualActivity from './_components/manual-activity.svelte';
	import StaticActivity from './_components/static-activity.svelte';

	$effect(() => {
		if (!macroTrackingQuickstartState.macroTrackingMetrics) {
			toast.warning('Fill in your metrics first');
			selectedStepsState.navigateToPage(page.url.pathname, 'previous');
		}
	});

	let selectedActivityAdjustmentType = $state<ActivityAdjustmentType>('Dynamic');

	function continueToNextPage(e: SubmitEvent) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);

		macroTrackingQuickstartState.staticActivityCalories =
			selectedActivityAdjustmentType === 'Static'
				? Number(formData.get('static-activity-adjustment-calories'))
				: undefined;
		macroTrackingQuickstartState.activityAdjustmentType = selectedActivityAdjustmentType;

		selectedStepsState.navigateToPage(page.url.pathname, 'next');
	}
</script>

<svelte:head>
	<meta name="required" content="true" />
	<meta
		name="description"
		content="Select your activity level to get a more accurate total daily energy expenditure (TDEE) estimate"
	/>
</svelte:head>

<form id="activity-levels-form" onsubmit={continueToNextPage}>
	<Tabs.Root bind:value={selectedActivityAdjustmentType} class="w-full">
		<Tabs.List class="grid grid-cols-3">
			<Tabs.Trigger value="Dynamic">Dynamic</Tabs.Trigger>
			<Tabs.Trigger value="Manual">Manual</Tabs.Trigger>
			<Tabs.Trigger value="Static">Static</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="Dynamic">
			<DynamicActivity />
		</Tabs.Content>
		<Tabs.Content value="Manual">
			<ManualActivity />
		</Tabs.Content>
		<Tabs.Content value="Static">
			<StaticActivity />
		</Tabs.Content>
	</Tabs.Root>
</form>

<div class="mt-auto grid grid-cols-2 gap-2">
	<Button
		variant="secondary"
		onclick={() => selectedStepsState.navigateToPage(page.url.pathname, 'previous')}
	>
		<ChevronLeftIcon /> Previous
	</Button>
	<Button type="submit" form="activity-levels-form">Next <ChevronRightIcon /></Button>
</div>
