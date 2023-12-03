<script lang="ts">
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
