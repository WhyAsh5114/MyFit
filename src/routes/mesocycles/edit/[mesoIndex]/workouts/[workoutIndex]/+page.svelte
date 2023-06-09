<script lang="ts">
	import SplitExercisesTable from '$lib/components/mesocycle/SplitExercisesTable.svelte';
	import { days } from '$lib/commonDB.js';

	export let data;
</script>

<SplitExercisesTable
	bind:currentDay={days[data.workoutIndex]}
	bind:workoutName={data.splitSchedule[data.workoutIndex]}
    bind:splitExercises={data.splitExercises}
/>
