<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { QUICKSTART_MACRO_TRACKING_GOAL_OPTIONS } from '$lib/constants';
	import { kebabToNormal } from '$lib/my-utils';
	import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { selectedStepsState } from '../../selected-steps.svelte';
	import { macroTrackingQuickstartState } from '../macro-tracking-quickstart-state.svelte';

	const goalOptions = QUICKSTART_MACRO_TRACKING_GOAL_OPTIONS;
	let selectedGoalOptionLabel = $state<(typeof goalOptions)[number]['label']>(goalOptions[3].label);

	$effect(() => {
		if (!macroTrackingQuickstartState.macroTrackingMetrics) {
			toast.warning('Fill in your metrics first');
			selectedStepsState.navigateToPage(page.url.pathname, 'previous');
		}
	});

	function continueToNextPage() {
		macroTrackingQuickstartState.selectedGoalOption = goalOptions.find(
			(option) => option.label === selectedGoalOptionLabel
		)!;
		selectedStepsState.navigateToPage(page.url.pathname, 'next');
	}
</script>

<svelte:head>
	<meta name="required" content="true" />
	<meta
		name="description"
		content="Select your current goal, lose fat, gain muscle, recomp, or just track"
	/>
</svelte:head>

<RadioGroup.Root class="grid gap-2" bind:value={selectedGoalOptionLabel}>
	{#each goalOptions as { label, description, Icon1, Icon2 } (label)}
		<Label
			for={label}
			class="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex items-center gap-4 rounded-md border-2 p-4"
		>
			<div class="flex flex-col items-center">
				<Icon1 size={36} />
				<Icon2 class="text-muted-foreground" size={20} />
			</div>
			<RadioGroup.Item value={label} id={label} class="sr-only" aria-label={label} />
			<div class="flex flex-col gap-1">
				<p>{kebabToNormal(label)}</p>
				<p class="text-muted-foreground leading-tight">{description}</p>
			</div>
		</Label>
	{/each}
</RadioGroup.Root>

<div class="mt-auto grid grid-cols-2 gap-2">
	<Button
		variant="secondary"
		onclick={() => selectedStepsState.navigateToPage(page.url.pathname, 'previous')}
	>
		<ChevronLeftIcon /> Previous
	</Button>
	<Button onclick={continueToNextPage}>Next <ChevronRightIcon /></Button>
</div>
