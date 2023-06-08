<script lang="ts">
	import VolumeOverviewHelpModal from './VolumeOverviewHelpModal.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { isExercisesValidStore, splitExercises } from '../newMesoStore';
	import { commonMuscleGroups } from '$lib/commonDB';
	import MuscleGroupComponent from '$lib/MuscleGroupComponent.svelte';

	onMount(() => {
		if (!$isExercisesValidStore || !$isExercisesValidStore()) {
			goto('/mesocycles/new/split');
		}
	});

	let muscleFrequency = Object.fromEntries(
		commonMuscleGroups.map((muscleGroup) => [muscleGroup, 0])
	);
	let muscleVolume = Object.fromEntries(commonMuscleGroups.map((muscleGroup) => [muscleGroup, 0]));
	$splitExercises.forEach((workout) => {
		let targetedMusclesOnDay: Set<string> = new Set();
		workout.forEach((exercise) => {
			muscleVolume[exercise.muscleTarget] += exercise.sets as number;
			targetedMusclesOnDay.add(exercise.muscleTarget);
		});
		targetedMusclesOnDay.forEach((muscleGroup) => {
			muscleFrequency[muscleGroup]++;
		});
	});

	let volumeOverviewModal: HTMLDialogElement;
</script>

<VolumeOverviewHelpModal bind:volumeOverviewModal />
<div class="flex flex-col gap-1 w-full p-1 rounded-md">
	<div class="flex justify-between items-center">
		<h3 class="font-semibold text-xl p-1">Volume Overview</h3>
		<button class="help-button" on:click={() => volumeOverviewModal.show()}>?</button>
	</div>
	{#each commonMuscleGroups as muscleGroup}
		<MuscleGroupComponent
			{muscleGroup}
			freq={muscleFrequency[muscleGroup]}
			volume={muscleVolume[muscleGroup]}
		/>
	{/each}
</div>
