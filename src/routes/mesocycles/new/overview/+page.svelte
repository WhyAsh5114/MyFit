<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { isExercisesValidStore, splitExercises } from '../newMesoStore';
	import { volumeLandmarks, commonMuscleGroups } from '$lib/commonDB';
	import VolumeProgress from './VolumeProgress.svelte';

	onMount(() => {
		// if (!$isExercisesValidStore || !$isExercisesValidStore()) {
		// 	goto('/mesocycles/new/split')
		// }
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
</script>

<div class="flex flex-col gap-1 w-full p-1 rounded-md">
	<div class="flex justify-between items-center">
		<h3 class="font-semibold text-xl p-1">Volume overview</h3>
		<button class="help-button">?</button>
	</div>
	{#each commonMuscleGroups as muscleGroup}
		<div class="flex w-full bg-primary font-semibold rounded-md px-2 py-0.5">
			<h4 class="shrink-0 basis-24">{muscleGroup}</h4>
			<VolumeProgress
				volumeLandmark={volumeLandmarks[muscleGroup]}
				volume={muscleVolume[muscleGroup]}
				frequency={muscleFrequency[muscleGroup]}
			/>
			{#if muscleFrequency[muscleGroup] < volumeLandmarks[muscleGroup].freqStart || muscleFrequency[muscleGroup] > volumeLandmarks[muscleGroup].freqEnd}
				{#if (muscleFrequency[muscleGroup] < 2 && volumeLandmarks[muscleGroup].MV > 0) || muscleFrequency[muscleGroup] === 7}
					<p class="ml-auto text-error">{muscleFrequency[muscleGroup]}x</p>
				{:else if volumeLandmarks[muscleGroup].MEV === 0}
					<p class="ml-auto">{muscleFrequency[muscleGroup]}x</p>
				{:else}
					<p class="ml-auto text-warning">{muscleFrequency[muscleGroup]}x</p>
				{/if}
			{:else}
				<p class="ml-auto text-success">{muscleFrequency[muscleGroup]}x</p>
			{/if}
		</div>
	{/each}
</div>

