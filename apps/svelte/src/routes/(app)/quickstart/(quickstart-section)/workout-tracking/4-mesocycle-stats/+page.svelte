<script>
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { workoutTrackingQuickstartState } from '../workout-tracking-quickstart-state.svelte';

	$effect(() => {
		if (!workoutTrackingQuickstartState.selectedSplitTemplate) {
			toast.warning('Select a split template first');
			goto('/quickstart/workout-tracking/1-select-split');
		}
	});
</script>

<svelte:head>
	<meta name="required" content="true" />
	<meta name="description" content="Name your training block, duration, and other stats" />
</svelte:head>
