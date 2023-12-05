<script lang="ts">
	import WorkoutExercisesTable from "$lib/components/workouts/WorkoutExercisesTable.svelte";
	import { dateFormatter } from "$lib/util/CommonFunctions.js";
	export let data;

	let allExercisesSetsCompleted: boolean[][] = [];
	data.workout.exercisesPerformed.forEach(({ sets }) => {
		allExercisesSetsCompleted.push(Array(sets.length).fill(true));
	});

    let muscleGroupWorkloads = data.workout.muscleGroupWorkloads;
    let sorenessFromPreviousWorkouts = {};

    async function updateWorkout() {

    }
</script>

<h2>Edit workout</h2>
<h3>{dateFormatter(data.workout.startTimestamp)}</h3>

<WorkoutExercisesTable
	bind:exercises={data.workout.exercisesPerformed}
	bind:allExercisesSetsCompleted
    bind:muscleGroupWorkloads
    bind:sorenessFromPreviousWorkouts
/>

<button class="btn btn-accent mt-2">Update workout</button>
