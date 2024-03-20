<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import ChartComponent from './ChartComponent.svelte';
	import { muscleGroups } from '$lib/arrays';
	import { exerciseSplitStore } from '../exerciseSplitStore';

	const sortedMuscleGroups = muscleGroups.toSorted((a, b) => getTotalVolume(b) - getTotalVolume(a));
	let selectedMuscleGroups = sortedMuscleGroups.slice(0, 3);
	let callingEndpoint = false;

	function createExerciseSplit() {
		callingEndpoint = true;
	}

	function getTotalVolume(muscleGroup: MuscleGroup) {
		return $exerciseSplitStore.splitDays.reduce((totalSets, splitDay) => {
			if (!splitDay) return totalSets;
			return (
				totalSets +
				splitDay.exerciseTemplates.reduce(
					(setsForDay, exercise) =>
						exercise.targetMuscleGroup === muscleGroup ? setsForDay + exercise.sets : setsForDay,
					0
				)
			);
		}, 0);
	}
</script>

<H2>New exercise split</H2>
<H3>Overview</H3>

<div class="flex h-px grow flex-col">
	<ChartComponent {selectedMuscleGroups} />
	<ToggleGroup.Root
		variant="outline"
		type="multiple"
		size="sm"
		class="grid grid-cols-3"
		bind:value={selectedMuscleGroups}
	>
		{#each sortedMuscleGroups as muscleGroup}
			<ToggleGroup.Item class="aria-pressed:bg-foreground" value={muscleGroup}>
				{muscleGroup}
			</ToggleGroup.Item>
		{/each}
	</ToggleGroup.Root>
</div>

<div class="grid grid-cols-2 gap-1">
	<Button variant="secondary">
		<a href="/exercise-splits/new/exercises" class="w-full">Back</a>
	</Button>
	<Button on:click={createExerciseSplit} disabled={callingEndpoint}>
		{#if callingEndpoint}
			<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
		{/if}
		Save
	</Button>
</div>
