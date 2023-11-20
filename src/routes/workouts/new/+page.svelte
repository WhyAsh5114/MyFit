<script lang="ts">
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
	if (todaysWorkout) {
		muscleGroupsAndSets = getMuscleGroupsAndSets(todaysWorkout.exercises);
		totalSets = getTotalSets(todaysWorkout.exercises);
	}
</script>

<div class="stats stats-vertical grid grid-cols-2">
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
	{:else}
		<div class="stat">
			<div class="stat-title">Workout template</div>
			<div class="stat-value">It's a Rest day!</div>
		</div>
	{/if}
</div>
