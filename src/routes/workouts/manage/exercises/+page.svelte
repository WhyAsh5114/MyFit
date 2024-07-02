<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import type { WorkoutExerciseInProgress } from '$lib/mesoToWorkouts.js';
	import { onMount } from 'svelte';
	import { workoutRunes } from '../workoutRunes.svelte.js';

	let { data } = $props();
	let workoutExercises: WorkoutExerciseInProgress[] | 'loading' = $state('loading');

	onMount(async () => {
		// TODO: implement local storage fetching for runes and stuff
		workoutExercises = await data.workoutExercises;
		console.log($state.snapshot(workoutExercises));
	});
</script>

<H3>Exercises</H3>
<span class="text-lg font-semibold">
	{workoutRunes.workoutData.workoutOfMesocycle?.splitDayName}
</span>
<p class="text-sm text-muted-foreground">
	Day {workoutRunes.workoutData.workoutOfMesocycle?.dayNumber}, Cycle {workoutRunes.workoutData
		.workoutOfMesocycle?.cycleNumber}
</p>
