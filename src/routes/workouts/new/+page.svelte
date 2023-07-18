<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	import { days } from '$lib/commonDB';
	import { slide, fly } from 'svelte/transition';
	import {
		workoutDay,
		plannedRIR,
		muscleTargetsAndSets,
		weekNumber,
		workoutExercises,
		referenceWorkout,
		startTimestamp,
		musclesTargetedPreviously
	} from './newWorkoutStore.js';
	export let data;

	let date = new Date();
	let todaysDay = days.at(date.getDay() - 1);
	$workoutDay = date.getDay() - 1 >= 0 ? date.getDay() - 1 : 6;

	$weekNumber = Math.ceil((+date - data.activeMesocycle.startDate) / (1000 * 60 * 60 * 24 * 7));
	$plannedRIR =
		data.parentMesocycle.startRIR -
		Math.floor(($weekNumber * data.parentMesocycle.startRIR) / data.parentMesocycle.duration);

	function splitExerciseToWorkoutExercise(splitEx: SplitExercise) {
		const workoutExercise: WorkoutExercise = {
			name: splitEx.name as string,
			repRangeStart: splitEx.repRangeStart as number,
			repRangeEnd: splitEx.repRangeEnd as number,
			muscleTarget: splitEx.muscleTarget as (typeof commonMuscleGroups)[number],
			setType: splitEx.setType as Exclude<SplitExercise['setType'], ''>,
			jointPainRating: undefined,
			pumpRating: undefined,
			disruptionRating: undefined,
			mindMuscleConnectionRating: undefined,
			repsLoadRIR: []
		};
		for (let i = 0; i < (splitEx.sets as number); i++) {
			workoutExercise.repsLoadRIR.push([undefined, undefined, $plannedRIR]);
		}
		return workoutExercise;
	}

	$workoutExercises = [];
	$: if ($referenceWorkout === null && data.parentMesocycle.splitExercises[$workoutDay] && $plannedRIR) {
		$workoutExercises = [];
		data.parentMesocycle.splitExercises[$workoutDay].forEach((exercise) => {
			$workoutExercises.push(splitExerciseToWorkoutExercise(exercise));
		});
		$workoutExercises = $workoutExercises;
	} else {
		// TODO: template from old workout and apply appropriate volume changes
	}

	$: {
		$muscleTargetsAndSets = {};
		$workoutExercises.forEach((exercise) => {
			if ($muscleTargetsAndSets[exercise.muscleTarget]) {
				$muscleTargetsAndSets[exercise.muscleTarget] += exercise.repsLoadRIR.length;
			} else {
				$muscleTargetsAndSets[exercise.muscleTarget] = exercise.repsLoadRIR.length;
			}
		});
	}

	// TODO: soreness calculation
	// iterate through workouts of activeMesocycle, and only use workouts which are less than 7 days older
	// if musclesGroups overlap found, someList.push({muscleTarget: 'Triceps', workoutID: 9})
	// whenever asking for workload feedback, also ask for soreness feedback.

	// Updater for totalSets (used in progress bar)
	$: totalSets = Object.values($muscleTargetsAndSets).reduce((partialSum, sets) => partialSum + sets, 0);

	let callingEndpoint = false;
	async function getMuscleTargetsLastPerformed() {
		const reqBody: APIWorkoutGetPreviouslyTargetedWorkouts = {
			muscleTargets: Object.keys($muscleTargetsAndSets) as (typeof commonMuscleGroups)[number][]
		};
		console.log(reqBody);
		const response = await fetch('/api/workouts/getPreviouslyTargetedWorkouts', {
			method: 'POST',
			body: JSON.stringify(reqBody),
			headers: {
				'content-type': 'application/json'
			}
		});

		if (response.ok) {
			const resBody: MuscleToLastWorkout[] = JSON.parse(await response.text());

			const muscleSorenessData: MuscleSorenessData[] = [];
			resBody.forEach((muscleAndWorkout) => {
				muscleSorenessData.push({ ...muscleAndWorkout, sorenessRating: undefined });
			});
			$musclesTargetedPreviously = muscleSorenessData;
		}
	}
</script>

<form
	class="flex flex-col w-full gap-2 h-full"
	on:submit|preventDefault={async () => {
		$startTimestamp = +new Date();
		callingEndpoint = true;
		await getMuscleTargetsLastPerformed();
		callingEndpoint = false;
		goto('/workouts/new/exercises');
	}}
>
	<div class="flex flex-col h-px grow overflow-y-auto gap-2">
		<div class="stats bg-primary shrink-0 w-full">
			<div class="stat">
				<div class="flex justify-between">
					<div class="opacity-90">Current mesocycle</div>
				</div>
				<div class="text-2xl font-bold text-white">{data.parentMesocycle.name}</div>
			</div>
		</div>
		<div class="stats bg-primary shrink-0 w-full">
			<div class="stat">
				<div class="flex justify-between">
					<div class="opacity-90">Workout template</div>
				</div>
				<div class="flex w-full items-center justify-between mt-1.5 gap-4">
					<p class="text-xl font-bold text-white">{todaysDay}</p>
					<select class="select select-sm select-bordered grow" bind:value={$workoutDay} required>
						{#each data.parentMesocycle.splitSchedule as workoutName, i}
							{#if workoutName}
								<option value={i}>{workoutName}</option>
							{:else}
								<option value="" disabled class="opacity-50">Rest</option>
							{/if}
						{/each}
					</select>
				</div>
			</div>
		</div>
		<div class="stats bg-primary shrink-0 w-full">
			<div class="stat">
				<div class="flex justify-between">
					<div class="opacity-90">Planned RIR</div>
				</div>
				<select class="select select-sm select-bordered mt-1.5" bind:value={$plannedRIR}>
					<option value={4}>4 RIR</option>
					<option value={3}>3 RIR</option>
					<option value={2}>2 RIR</option>
					<option value={1}>1 RIR</option>
					<option value={0}>0 RIR</option>
				</select>
			</div>
		</div>
		{#if data.parentMesocycle.splitSchedule[$workoutDay] !== ''}
			<div class="stats bg-primary shrink-0 w-full" in:slide>
				<div class="stat">
					<div class="flex justify-between">
						<div class="opacity-90">Total work volume</div>
					</div>
					{#key $workoutDay}
						<div class="text-xl font-bold text-white" in:fly={{ y: -10 }}>{totalSets} sets</div>
					{/key}
				</div>
			</div>
			<div class="stats bg-primary shrink-0 w-full" in:slide>
				<div class="stat">
					<div class="flex justify-between">
						<div class="opacity-90">Muscle targets</div>
					</div>
					{#key $workoutDay}
						<div class="flex flex-wrap mt-2 gap-1" in:fly={{ y: -10 }}>
							{#each Object.keys($muscleTargetsAndSets) as muscleTarget}
								<span class="badge text-white">{muscleTarget} x {$muscleTargetsAndSets[muscleTarget]}</span>
							{/each}
						</div>
					{/key}
				</div>
			</div>
			<div class="stats bg-primary shrink-0 w-full" in:slide>
				<div class="stat">
					<div class="flex justify-between">
						<div class="opacity-90">Reference workout</div>
					</div>
					{#key $workoutDay}
						<div class="mt-2" in:fly={{ y: -10 }}>
							<!-- TODO: if reference workout, use referenceWorkout store -->
							<p class="text-white">No reference workout found for</p>
							<p class="text-accent font-semibold">
								{data.parentMesocycle.splitSchedule[$workoutDay]}
								({days[$workoutDay]})
							</p>
						</div>
					{/key}
				</div>
			</div>
		{/if}
	</div>
	<button class="btn btn-block btn-accent mt-auto">
		{#if $navigating?.to?.url.pathname === '/workouts/new/exercises' || callingEndpoint}
			<span class="loading loading-spinner" />
		{/if}
		Start logging
	</button>
</form>
