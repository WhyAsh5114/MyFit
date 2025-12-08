<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { selectedStepsState } from '../../selected-steps.svelte';
	import { workoutTrackingQuickstartState } from '../workout-tracking-quickstart-state.svelte';

	$effect(() => {
		if (!workoutTrackingQuickstartState.selectedSplitTemplate) {
			toast.warning('Select a split template first');
			goto(resolve('/quickstart/workout-tracking/1-select-split'));
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
