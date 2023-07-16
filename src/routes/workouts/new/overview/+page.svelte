<script lang="ts">
	import { onMount } from 'svelte';
	import {
		startTimestamp,
		workoutExercises,
		plannedRIR,
		weekNumber,
		workoutDay,
		muscleWorkloads,
		muscleSorenessToNextWorkout,
		referenceWorkout
	} from '../newWorkoutStore.js';
	import { goto } from '$app/navigation';
	import MyModal from '$lib/components/MyModal.svelte';
	export let data;

	onMount(() => {
		if (!$startTimestamp || $workoutExercises.length === 0) {
			goto('/workouts/new');
		}
	});

	let diff = +new Date() - $startTimestamp;

	let totalSets = 0;
	$: {
		totalSets = 0;
		$workoutExercises.forEach((exercise) => {
			totalSets += exercise.repsLoadRIR.length;
		});
	}

	let averageRIR = 0;
	$: {
		averageRIR = 0;
		$workoutExercises.forEach((exercise) => {
			exercise.repsLoadRIR.forEach((repLoadRIR) => {
				averageRIR += repLoadRIR[2];
			});
		});
		averageRIR = Math.round((averageRIR / totalSets) * 100) / 100;
	}

	let difficultyRating: 1 | 2 | 3 | 4 | 5 = 2;
	let callingEndpoint = false;
	let errorMsg = '';
	async function saveWorkout() {
		callingEndpoint = true;
		const thisWorkout: Workout = {
			startTimestamp: $startTimestamp,
			endTimestamp: $startTimestamp + diff,
			mesoID: data.activeMesocycle.mesoID,
			dayNumber: $workoutDay,
			difficultyRating,
			exercisesPerformed: $workoutExercises,
			plannedRIR: $plannedRIR,
			muscleGroupWorkloads: $muscleWorkloads,
			muscleSorenessToNextWorkout: $muscleSorenessToNextWorkout,
			referenceWorkout: $referenceWorkout,
			weekNumber: $weekNumber
		};
		const reqBody: APIWorkoutCreate = { workout: thisWorkout };
		const response = await fetch('/api/workouts/create', {
			method: 'POST',
			body: JSON.stringify(reqBody),
			headers: {
				'content-type': 'application/json'
			}
		});
		if (response.ok) {
			$workoutExercises = [];
			successModal.show();
		} else {
			errorMsg = await response.text();
			errorModal.show();
		}
		callingEndpoint = false;
	}

	let successModal: HTMLDialogElement;
	let errorModal: HTMLDialogElement;
</script>

<MyModal
	bind:dialogElement={successModal}
	title="Success"
	titleColor="text-success"
	onClose={() => {
		goto('/workouts');
	}}
>
	<p>Workout saved successfully</p>
</MyModal>

<MyModal bind:dialogElement={errorModal} title="Error" titleColor="text-error">
	<p>{errorMsg}</p>
</MyModal>

<div class="flex flex-col h-px grow overflow-y-auto w-full gap-2">
	<div class="stats bg-primary grid-cols-2">
		<div class="stat">
			<div>Duration</div>
			<div class="font-bold text-2xl text-secondary">
				{Math.floor(diff / 1000 / 3600)} hr {Math.floor(diff / 1000 / 60) % 60} m
			</div>
		</div>
		<div class="stat">
			<div>Volume</div>
			<div class="font-bold text-2xl text-secondary">{totalSets} sets</div>
		</div>
	</div>
	<div class="stats bg-primary grid-cols-2 place-items-start">
		<div class="stat">
			<div>Average RIR</div>
			<div class="font-bold text-2xl text-secondary">
				{averageRIR} RIR
			</div>
			{#if averageRIR < $plannedRIR - 0.5}
				<div class=" text-sm text-error">Go easier</div>
			{:else if averageRIR > $plannedRIR + 0.5}
				<div class=" text-sm text-error">Go harder</div>
			{:else}
				<div class="">RIR matched with plan</div>
			{/if}
		</div>
		<div class="stat">
			<div>Planned RIR</div>
			<div class="font-bold text-2xl text-secondary">
				{$plannedRIR} RIR
			</div>
			<div class="">
				Week {$weekNumber}
			</div>
		</div>
	</div>
	<div class="stats bg-primary grid-cols-2">
		<div class="stat">
			<div>Difficulty rating</div>
			<div class="font-bold text-2xl text-secondary">
				<div class="rating mt-1">
					{#each Array(5).fill(0) as num, i}
						<input
							type="radio"
							name="difficulty-rating"
							bind:group={difficultyRating}
							value={i + 1}
							class="mask mask-star bg-warning"
						/>
					{/each}
				</div>
			</div>
		</div>
		<div class="stat">
			<div>Workout type</div>
			<div class="font-semibold text-secondary">
				{data.parentMesocycle.splitSchedule[$workoutDay]}
			</div>
		</div>
	</div>
</div>
<button class="btn btn-block btn-accent" on:click={saveWorkout}>
	{#if callingEndpoint}
		<span class="loading loading-spinner" />
	{/if}
	Save workout
</button>
