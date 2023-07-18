<script lang="ts">
	import { onMount } from 'svelte';
	import {
		startTimestamp,
		workoutExercises,
		plannedRIR,
		weekNumber,
		workoutDay,
		muscleWorkloads,
		referenceWorkout,
		musclesTargetedPreviously
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
			muscleSorenessToNextWorkout: {
				Chest: undefined,
				'Front delts': undefined,
				'Side delts': undefined,
				'Rear delts': undefined,
				Back: undefined,
				Traps: undefined,
				Triceps: undefined,
				Biceps: undefined,
				Forearms: undefined,
				Quads: undefined,
				Hamstrings: undefined,
				Glutes: undefined,
				Calves: undefined
			},
			referenceWorkout: $referenceWorkout,
			weekNumber: $weekNumber
		};
		const reqBody: APIWorkoutCreate = { workout: thisWorkout, sorenessValues: $musclesTargetedPreviously };
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
		<dl class="stat">
			<dt>Duration</dt>
			<dd class="font-bold text-2xl text-secondary">
				{Math.floor(diff / 1000 / 3600)} hr {Math.floor(diff / 1000 / 60) % 60} m
			</dd>
		</dl>
		<dl class="stat">
			<dt>Volume</dt>
			<dd class="font-bold text-2xl text-secondary">{totalSets} sets</dd>
		</dl>
	</div>
	<div class="stats bg-primary grid-cols-2 place-items-start">
		<div class="stat">
			<dl>
				<dt>Average RIR</dt>
				<dd class="font-bold text-2xl text-secondary">
					{averageRIR} RIR
				</dd>
			</dl>
			{#if averageRIR < $plannedRIR - 0.5}
				<div class="text-sm text-error">Go easier</div>
			{:else if averageRIR > $plannedRIR + 0.5}
				<div class="text-sm text-error">Go harder</div>
			{:else}
				<div class="text-sm">Matched with plan</div>
			{/if}
		</div>
		<div class="stat">
			<dl>
				<dt>Planned RIR</dt>
				<dd class="font-bold text-2xl text-secondary">
					{$plannedRIR} RIR
				</dd>
			</dl>
			<div class="text-sm">
				Week {$weekNumber}
			</div>
		</div>
	</div>
	<div class="stats bg-primary grid-cols-2">
		<div class="stat">
			<div id="diff-rating-label">Difficulty rating</div>
			<div class="font-bold text-2xl text-secondary">
				<div class="rating mt-1">
					{#each Array(5).fill(0) as num, i}
						<input
							type="radio"
							name="difficulty-rating"
							bind:group={difficultyRating}
							value={i + 1}
							class="mask mask-star bg-warning"
							aria-labelledby="diff-rating-label"
						/>
					{/each}
				</div>
			</div>
		</div>
		<dl class="stat">
			<dt>Workout type</dt>
			<dd class="font-semibold text-secondary">
				{data.parentMesocycle.splitSchedule[$workoutDay]}
			</dd>
		</dl>
	</div>
</div>
<button class="btn btn-block btn-accent" on:click={saveWorkout}>
	{#if callingEndpoint}
		<span class="loading loading-spinner" />
	{/if}
	Save workout
</button>
