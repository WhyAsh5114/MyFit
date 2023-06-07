<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { isExercisesValidStore, splitExercises } from '../newMesoStore';
	import { volumeLandmarks, commonMuscleGroups } from '$lib/commonDB';
	import VolumeProgress from './VolumeProgress.svelte';
	import MyModal from '$lib/MyModal.svelte';
	import MuscleGroupComponent from './MuscleGroupComponent.svelte';

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

	let volumeOverviewModal: HTMLDialogElement;
</script>

<MyModal
	title="Volume Overview Help"
	titleColor="text-accent"
	bind:dialogElement={volumeOverviewModal}
>
	<div class="carousel w-full">
		<div id="item1" class="carousel-item w-full">
			<div class="flex flex-col">
				<p>
					The volume overview provides a brief overview of the volume of the exercises and frequency
				</p>
				<VolumeProgress
					volumeLandmark={volumeLandmarks['Chest']}
					volume={muscleVolume[8]}
					frequency={muscleFrequency[2]}
				/>
			</div>
		</div>
		<div id="item2" class="carousel-item w-full">
			<p />
		</div>
		<div id="item3" class="carousel-item w-full">
			<p />
		</div>
		<div id="item4" class="carousel-item w-full">
			<p />
		</div>
	</div>
	<div class="flex justify-center w-full py-2 gap-2">
		<a href="#item1" class="btn btn-xs">1</a>
		<a href="#item2" class="btn btn-xs">2</a>
		<a href="#item3" class="btn btn-xs">3</a>
		<a href="#item4" class="btn btn-xs">4</a>
	</div>
</MyModal>
<div class="flex flex-col gap-1 w-full p-1 rounded-md">
	<div class="flex justify-between items-center">
		<h3 class="font-semibold text-xl p-1">Volume overview</h3>
		<button class="help-button" on:click={() => volumeOverviewModal.show()}>?</button>
	</div>
	{#each commonMuscleGroups as muscleGroup}
		<MuscleGroupComponent
			{muscleGroup}
			volumeLandmark={volumeLandmarks[muscleGroup]}
			freq={muscleFrequency[muscleGroup]}
			volume={muscleVolume[muscleGroup]}
		/>
	{/each}
</div>
