<script>
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte';
	import { selectedStepsState } from '../../selected-steps.svelte';

	function continueToNextPage() {
		selectedStepsState.navigateToPage(page.url.pathname, 'next');
	}
</script>

<svelte:head>
	<meta name="description" content="Move days around, add a rest day, remove a rest day" />
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
