<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import type { MacroTrackingActivitySchema } from '$routes/(app)/food-diary/goals/activity/_components/activity-form-schema';
	import ActivityForm from '$routes/(app)/food-diary/goals/activity/_components/activity-form.svelte';
	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte';
	import type { ActivityAdjustmentType } from '$lib/generated/prisma/client';
	import { toast } from 'svelte-sonner';
	import { writable } from 'svelte/store';
	import { selectedStepsState } from '../../selected-steps.svelte';
	import { macroTrackingQuickstartState } from '../macro-tracking-quickstart-state.svelte';

	let formData = $state(writable<MacroTrackingActivitySchema>());

	$effect(() => {
		if (!macroTrackingQuickstartState.macroTrackingMetrics) {
			toast.warning('Fill in your metrics first');
			selectedStepsState.navigateToPage(page.url.pathname, 'previous');
		} else if (macroTrackingQuickstartState.activityAdjustmentType) {
			$formData.adjustmentType = macroTrackingQuickstartState.activityAdjustmentType;
			$formData.staticCalories = macroTrackingQuickstartState.staticActivityCalories ?? null;
		}
	});

	let selectedActivityAdjustmentType = $state<ActivityAdjustmentType>('Dynamic');
	let staticCalories = $state<number>(500);

	async function continueToNextPage() {
		macroTrackingQuickstartState.staticActivityCalories =
			selectedActivityAdjustmentType === 'Static' ? staticCalories : undefined;
		macroTrackingQuickstartState.activityAdjustmentType = selectedActivityAdjustmentType;

		await selectedStepsState.navigateToPage(page.url.pathname, 'next');
	}
</script>

<svelte:head>
	<meta name="required" content="true" />
	<meta
		name="description"
		content="Select your activity level to get a more accurate total daily energy expenditure (TDEE) estimate"
	/>
</svelte:head>

<ActivityForm
	bind:formData
	onUpdate={async ({ form }) => {
		if (!form.valid) return;
		await continueToNextPage();
	}}
/>

<div class="mt-auto grid grid-cols-2 gap-2">
	<Button
		variant="secondary"
		onclick={() => selectedStepsState.navigateToPage(page.url.pathname, 'previous')}
	>
		<ChevronLeftIcon /> Previous
	</Button>
	<!-- <Button onclick={continueToNextPage}>
		Next <ChevronRightIcon />
	</Button> -->
	<Button type="submit" form="activity-form">Next <ChevronRightIcon /></Button>
</div>
