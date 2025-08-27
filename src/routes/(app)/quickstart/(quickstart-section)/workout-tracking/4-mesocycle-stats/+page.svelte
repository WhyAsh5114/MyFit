<script>
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { workoutTrackingQuickstartState } from '../workout-tracking-quickstart-state.svelte';
	import { page } from '$app/state';
	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte';
	import { selectedStepsState } from '../../selected-steps.svelte';
	import { Button } from '$lib/components/ui/button';

	$effect(() => {
		if (!workoutTrackingQuickstartState.selectedSplitTemplate) {
			toast.warning('Select a split template first');
			goto('/quickstart/workout-tracking/1-select-split');
		}
	});

	function continueToNextPage() {
		selectedStepsState.navigateToPage(page.url.pathname, 'next');
	}
</script>

<svelte:head>
	<meta name="required" content="true" />
	<meta name="description" content="Name your training block, duration, and other stats" />
</svelte:head>

<div class="grid grid-cols-2 gap-2">
	<Button
		variant="secondary"
		onclick={() => selectedStepsState.navigateToPage(page.url.pathname, 'previous')}
	>
		<ChevronLeftIcon /> Previous
	</Button>
	<Button onclick={continueToNextPage}>Next <ChevronRightIcon /></Button>
</div>
