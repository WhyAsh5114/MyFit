<script lang="ts">
	import { page } from "$app/stores";
	import WorkoutExercisesTable from "$lib/components/workouts/WorkoutExercisesTable.svelte";
	import { dateFormatter } from "$lib/util/CommonFunctions.js";
	export let data;
</script>

<div class="stats stats-vertical">
	<div class="stat">
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
</div>
<WorkoutExercisesTable exercises={data.workout.exercisesPerformed} mode="performed" />
<div class="join grid grid-cols-2 mt-2">
	<button class="join-item btn btn-error">Delete</button>
	<a class="join-item btn btn-primary" href="/workouts/edit/{$page.params.workoutId}">Edit</a>
</div>
