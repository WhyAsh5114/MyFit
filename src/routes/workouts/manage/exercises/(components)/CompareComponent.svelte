<script lang="ts">
	import type { WorkoutExerciseInProgress } from '$lib/workoutFunctions';
	import { workoutRunes } from '../../workoutRunes.svelte';

	type PropsType = { exercise: WorkoutExerciseInProgress };
	let { exercise }: PropsType = $props();

	let prevExercise = workoutRunes.previousWorkoutData?.exercises.find(
		(ex) => ex.name === exercise.name
	);
</script>

{#if prevExercise}
	<div class="flex flex-col">
		{#each exercise.sets as set, idx}
			<span>{prevExercise.sets[idx].reps} -> {set.reps}</span>
		{/each}
	</div>
{/if}
