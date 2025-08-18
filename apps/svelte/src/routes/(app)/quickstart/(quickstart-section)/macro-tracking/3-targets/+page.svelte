<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import type { MacroTrackingTargetsSchema } from '$routes/(app)/food-diary/goals/targets/_components/targets-form-schema';
	import TargetsForm from '$routes/(app)/food-diary/goals/targets/_components/targets-form.svelte';
	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { writable } from 'svelte/store';
	import { selectedStepsState } from '../../selected-steps.svelte';
	import { macroTrackingQuickstartState } from '../macro-tracking-quickstart-state.svelte';

	let formData = $state(writable<MacroTrackingTargetsSchema>());

	$effect(() => {
		if (!macroTrackingQuickstartState.activityAdjustmentType) {
			toast.warning('Select your activity adjustment type first');
			selectedStepsState.navigateToPage(page.url.pathname, 'previous');
		}
	});

	async function continueToNextPage() {
		macroTrackingQuickstartState.selectedWeightChange = $formData.caloricChange / 7700;
		macroTrackingQuickstartState.selectedMacroTargetQuantifier = $formData.quantifier;
		macroTrackingQuickstartState.carbs = $formData.carbs;
		macroTrackingQuickstartState.proteins = $formData.proteins;
		macroTrackingQuickstartState.fats = $formData.fats;

		try {
			await macroTrackingQuickstartState.saveDataToIndexedDB();
			toast.success('Data saved successfully');
			goto('/dashboard');
		} catch (error) {
			if (error instanceof Error) toast.error(error.message);
		}
	}
</script>

<svelte:head>
	<meta name="required" content="true" />
	<meta name="description" content="Select your targets and rates for weight change" />
</svelte:head>

<TargetsForm
	bind:formData
	onUpdate={({ form }) => {
		if (!form.valid) {
			toast.error('Error saving targets', { description: form.errors._errors?.join(', ') });
			return;
		}
		continueToNextPage();
	}}
/>

<div class="mt-auto grid grid-cols-2 gap-2">
	<Button
		variant="secondary"
		onclick={() => selectedStepsState.navigateToPage(page.url.pathname, 'previous')}
	>
		<ChevronLeftIcon /> Previous
	</Button>
	<Button onclick={continueToNextPage}>Next <ChevronRightIcon /></Button>
</div>
