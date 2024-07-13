<script lang="ts">
	import type { WorkoutExerciseInProgress, WorkoutExerciseWithSets } from '$lib/workoutFunctions';

	type PropsType = {
		exercise: WorkoutExerciseInProgress;
		prevExercise: WorkoutExerciseWithSets | undefined;
	};
	let { exercise, prevExercise }: PropsType = $props();
</script>

<div class="flex flex-col">
	{#each exercise.sets as set, idx}
		<span>{set.reps} -> {prevExercise?.sets[idx].reps}</span>
	{/each}
</div>
