<script lang="ts">
	import { goto, invalidate } from "$app/navigation";
	import { dateFormatter } from "$lib/util/CommonFunctions.js";
	import {
		getCycleNumber,
		getMuscleGroupsAndSets,
		getPlannedRIR,
		getTodaysWorkout,
		getTotalSets
	} from "$lib/util/MesocycleTemplate.js";

	export let data;
	const { activeMesocycle, activeMesocycleTemplate } = data;
	const { workout: todaysWorkout, workoutIdx } = getTodaysWorkout(
		activeMesocycle.workouts,
		activeMesocycleTemplate.exerciseSplit
	);
	let muscleGroupsAndSets: { muscleGroup: MuscleGroup; sets: number }[];
	let totalSets = 0;
	let bodyweightExercises = false;
	if (todaysWorkout) {
		muscleGroupsAndSets = getMuscleGroupsAndSets(todaysWorkout.exercises);
		totalSets = getTotalSets(todaysWorkout.exercises);
		for (const exercise of todaysWorkout.exercises) {
			if (exercise.weightType.includes("Bodyweight")) {
				bodyweightExercises = true;
				break;
			}
		}
	}

	let bodyweightInput = data.userPreferences?.bodyweight || null;
	let callingEndpoint = false;
	async function submitForm() {
		if (bodyweightExercises && bodyweightInput !== null) {
			const requestBody: APIUserUpdatePreferences = {
				bodyweight: bodyweightInput
			};
			callingEndpoint = true;
			const response = await fetch("/api/user/updatePreferences", {
				method: "POST",
				body: JSON.stringify(requestBody),
				headers: {
					"content-type": "application/json"
				}
			});
			callingEndpoint = false;
			await invalidate("user:preferences");
			await goto("/workouts/new/exercises");
		}
	}
</script>

<form
	on:submit|preventDefault={submitForm}
	id="workoutForm"
	class="stats stats-vertical grid grid-cols-2"
>
	{#if todaysWorkout}
		<div class="stat col-span-2">
			<div class="stat-title">Workout template</div>
			<div class="stat-value">
				{todaysWorkout.name}
			</div>
			<div class="stat-desc">
				Day {workoutIdx + 1}, Cycle {getCycleNumber(
					activeMesocycleTemplate.exerciseSplit,
					activeMesocycle.workouts
				)}
			</div>
		</div>
		<div class="stat">
			<div class="stat-title">Total sets</div>
			<div class="stat-value">{totalSets}</div>
		</div>
		<div class="stat">
			<div class="stat-title">Planned RIR</div>
			<div class="stat-value">
				{getPlannedRIR(activeMesocycleTemplate, activeMesocycle.workouts)}
			</div>
		</div>
		<div class="stat col-span-2">
			<div class="stat-title">Muscle groups</div>
			<div class="flex flex-wrap gap-1 mt-2 font-semibold">
				{#each muscleGroupsAndSets as { muscleGroup, sets }}
					{@const specialized = activeMesocycleTemplate.specialization?.includes(muscleGroup)}
					<span class="badge {specialized ? 'badge-accent' : ''}">{muscleGroup} x {sets}</span>
				{/each}
			</div>
		</div>
		<div class="stat col-span-2">
			<div class="stat-title">Reference workout</div>
			<div class="stat-value">
				{#if data.referenceWorkoutTimestamp}
					{dateFormatter(data.referenceWorkoutTimestamp)}
				{:else}
					Not found
				{/if}
			</div>
		</div>
		{#if bodyweightExercises}
			<div class="stat col-span-2">
				<div class="stat-title mb-2">Bodyweight</div>
				<input
					type="number"
					id="bodyweight"
					step={0.01}
					class="input"
					placeholder="Type here"
					bind:value={bodyweightInput}
					required
				/>
			</div>
		{/if}
	{:else}
		<div class="stat">
			<div class="stat-title">Workout template</div>
			<div class="stat-value">It's a Rest day!</div>
		</div>
	{/if}
</form>

<button type="submit" form="workoutForm" class="btn btn-accent mt-auto">
	{#if callingEndpoint}
		<span class="loading loading-bars"></span>
	{:else}
		Log workout
	{/if}
</button>
