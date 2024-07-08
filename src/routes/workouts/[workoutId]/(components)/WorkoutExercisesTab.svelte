<script lang="ts">
	import type { FullWorkoutWithMesoData } from '../+page.server';
	import WorkoutExerciseCard from './WorkoutExerciseCard.svelte';

	type PropsType = { workout: FullWorkoutWithMesoData };
	let { workout }: PropsType = $props();
</script>

<div class="flex h-px grow flex-col gap-1 overflow-y-auto">
	{#each workout.workoutExercises as exercise}
		<WorkoutExerciseCard {exercise} />
	{/each}
</div>
