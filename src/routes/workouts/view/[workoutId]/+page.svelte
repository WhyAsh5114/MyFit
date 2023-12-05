<script lang="ts">
	import { page } from "$app/stores";
	import WorkoutExercisesTable from "$lib/components/workouts/WorkoutExercisesTable.svelte";
	import { dateFormatter } from "$lib/util/CommonFunctions.js";
	import StarIcon from "virtual:icons/material-symbols/star";
	export let data;
</script>

<div class="collapse collapse-arrow bg-primary rounded-md">
	<input type="checkbox" id="view-workout-details" checked />
	<div class="collapse-title text-xl font-medium">Workout details</div>
	<div class="collapse-content backdrop-brightness-75 px-1">
		<div class="stats-vertical grid grid-cols-2 w-full max-h-64">
			<div class="stat col-span-2">
				<div class="stat-title">Workout date</div>
				<div class="stat-value">{dateFormatter(data.workout.startTimestamp)}</div>
			</div>

			<div class="stat">
				<div class="stat-title">Workout type</div>
				<div class="stat-value">
					{data.mesocycleTemplate?.exerciseSplit[data.workout.dayNumber]?.name}
				</div>
				<div class="stat-desc">
					Day {data.workout.dayNumber}, Cycle {data.workout.cycleNumber}
				</div>
			</div>
			<div class="stat">
				<div class="stat-title">Reference workout</div>
				<div class="stat-value">
					{#if data.referenceWorkout}
						<a href="/workouts/view/{data.referenceWorkout.id}" class="truncate link">
							{dateFormatter(data.referenceWorkout.startTimestamp)}
						</a>
					{:else}
						Not found
					{/if}
				</div>
				{#if data.referenceWorkout}
					<div class="stat-desc">
						Day {data.referenceWorkout.dayNumber}, Cycle {data.referenceWorkout.cycleNumber}
					</div>
				{:else}
					<div class="stat-desc">Used meso exercises</div>
				{/if}
			</div>

			<div class="stat">
				<div class="stat-title">Mesocycle template</div>
				<div class="stat-value truncate">
					<a href="/mesocycles/view/{data.mesocycleTemplate?.id}" class="link">
						{data.mesocycleTemplate?.name}
					</a>
				</div>
			</div>
			<div class="stat">
				<div class="stat-title">Difficulty rating</div>
				<div class="stat-value flex items-center gap-1">
					{data.workout.difficultyRating}
					<StarIcon class="text-orange-400" />
				</div>
			</div>

			<div class="stat col-span-2">
				<div class="stat-title">Muscle group workloads</div>
				<div class="flex flex-wrap mt-1 gap-1">
					{#each Object.entries(data.workout.muscleGroupWorkloads) as [muscleGroup, workloadState]}
						<div class="join text-sm">
							<span class="join-item bg-base-200 px-2">{muscleGroup}</span>
							<span class="join-item bg-error px-2">{workloadState}</span>
						</div>
					{/each}
				</div>
			</div>

			<div class="stat col-span-2">
				<div class="stat-title">Soreness to next workouts</div>
			</div>
		</div>
	</div>
</div>
<WorkoutExercisesTable exercises={data.workout.exercisesPerformed} mode="performed" />
<div class="join grid grid-cols-2 mt-2">
	<button class="join-item btn btn-error">Delete</button>
	<a class="join-item btn btn-primary" href="/workouts/edit/{$page.params.workoutId}">Edit</a>
</div>
