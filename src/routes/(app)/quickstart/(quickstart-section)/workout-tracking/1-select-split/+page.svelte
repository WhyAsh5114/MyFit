<script lang="ts">
	import { page } from '$app/state';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { EXERCISE_SPLIT_TEMPLATES, SUGGESTED_DAYS_PER_WEEK } from '$lib/constants';
	import { client } from '$lib/idb-client';
	import type { FitnessKnowledge } from '@prisma/client';
	import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { selectedStepsState } from '../../selected-steps.svelte';
	import { workoutTrackingQuickstartState } from '../workout-tracking-quickstart-state.svelte';

	let daysPerWeek = $state<number>();
	let searchString = $state('');
	let fitnessKnowledgeLevel = $state<FitnessKnowledge>();
	let selectedSplitTemplateName = $state<string>('');

	let filteredWorkoutSplits = $derived(
		EXERCISE_SPLIT_TEMPLATES.filter(
			(split) => split.splitDays.filter((day) => day.splitDaySessions.length).length === daysPerWeek
		).filter((split) => split.name.toLowerCase().includes(searchString.toLowerCase()))
	);

	$effect(() => {
		if (workoutTrackingQuickstartState.selectedSplitTemplate) {
			selectedSplitTemplateName = workoutTrackingQuickstartState.selectedSplitTemplate.name;
			daysPerWeek = workoutTrackingQuickstartState.selectedSplitTemplate.splitDays.filter(
				(day) => day.splitDaySessions.length
			).length;
		} else {
			getDaysPerWeek();
		}
	});

	async function getDaysPerWeek() {
		const userData = await client.user.findFirst({
			include: { gettingStartedAnswers: true }
		});
		if (!userData?.gettingStartedAnswers) {
			daysPerWeek = 3;
			return;
		}

		if (userData.gettingStartedAnswers) {
			fitnessKnowledgeLevel = userData.gettingStartedAnswers.fitnessKnowledge;
			daysPerWeek = SUGGESTED_DAYS_PER_WEEK[fitnessKnowledgeLevel];
		}
	}

	function continueToNextPage() {
		workoutTrackingQuickstartState.selectedSplitTemplate = EXERCISE_SPLIT_TEMPLATES.find(
			(split) => split.name === selectedSplitTemplateName
		);
		if (!workoutTrackingQuickstartState.selectedSplitTemplate) {
			return toast.warning('Select a split template first');
		}

		selectedStepsState.navigateToPage(page.url.pathname, 'next');
	}
</script>

<svelte:head>
	<meta name="required" content="true" />
	<meta name="description" content="Select an exercise split based on your time constraints" />
</svelte:head>

<div class="grid gap-2">
	<div class="flex gap-2">
		<Input placeholder="Search..." bind:value={searchString} />
		<Button class="shrink-0" size="icon"><PlusIcon /></Button>
	</div>
	<Popover.Root>
		<Popover.Trigger>
			{#snippet child({ props })}
				<Button class="shrink-0" variant="secondary" {...props}>{daysPerWeek}x per week</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content
			class="flex w-(--bits-popover-anchor-width) flex-col gap-3 shadow-2xl shadow-black"
			preventScroll
		>
			<Slider type="single" bind:value={daysPerWeek} max={7} step={1} min={2} />
			{#if fitnessKnowledgeLevel}
				<p class="text-center text-sm">
					We recommend <span class="font-semibold">
						{SUGGESTED_DAYS_PER_WEEK[fitnessKnowledgeLevel]}
					</span>
					days per week based on your fitness level
					<span class="font-semibold">({fitnessKnowledgeLevel})</span>
				</p>
			{/if}
		</Popover.Content>
	</Popover.Root>
</div>

<RadioGroup.Root
	bind:value={selectedSplitTemplateName}
	class="grid grow items-start gap-2 md:-mt-2"
>
	{#each filteredWorkoutSplits as split (split.name)}
		<Label
			for={split.name}
			class="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary rounded-md border-2"
		>
			<RadioGroup.Item value={split.name} id={split.name} class="sr-only" aria-label={split.name} />
			<Card.Root class="border-0">
				<Card.Header>
					<Card.Title>{split.name}</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-wrap gap-1">
						{#each split.splitDays as day, idx (idx)}
							{#if day.splitDaySessions.length}
								<Badge>{day.splitDaySessions[0].name}</Badge>
							{:else}
								<Badge variant="outline">Rest</Badge>
							{/if}
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</Label>
	{:else}
		<p class="text-center p-2 text-muted-foreground border rounded-md">
			No such workout splits available
		</p>
	{/each}
</RadioGroup.Root>

<div class="grid grid-cols-2 gap-2">
	<Button
		variant="secondary"
		onclick={() => selectedStepsState.navigateToPage(page.url.pathname, 'previous')}
	>
		<ChevronLeftIcon /> Previous
	</Button>
	<Button onclick={continueToNextPage}>Next <ChevronRightIcon /></Button>
</div>
