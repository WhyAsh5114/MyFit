<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ExerciseSplitComponent from '$lib/components/exercise-split-component.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { ExerciseSplitTemplate } from '$lib/constants';
	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { selectedStepsState } from '../../selected-steps.svelte';
	import { workoutTrackingQuickstartState } from '../workout-tracking-quickstart-state.svelte';

	let currentSplit = $state<ExerciseSplitTemplate>();

	$effect(() => {
		if (!workoutTrackingQuickstartState.selectedSplitTemplate) {
			toast.warning('Select a split template first');
			goto('/quickstart/workout-tracking/1-select-split');
			return;
		}
		currentSplit = workoutTrackingQuickstartState.selectedSplitTemplate;
	});
</script>

<svelte:head>
	<meta name="description" content="Customize the routines by modifying the exercise list" />
</svelte:head>

{#if currentSplit}
	<ExerciseSplitComponent {currentSplit} />

	<div class="grid grid-cols-2 gap-2">
		<Button
			variant="secondary"
			onclick={() => selectedStepsState.navigateToPage(page.url.pathname, 'previous')}
		>
			<ChevronLeftIcon /> Previous
		</Button>
		<Button>Next <ChevronRightIcon /></Button>
	</div>
{/if}
