<script lang="ts">
	import { convertCamelCaseToNormal } from '$lib/utils';
	import type { FullWorkoutWithMesoData } from '../+page.server';
	import WorkoutExerciseCard from './WorkoutExerciseCard.svelte';

	type PropsType = { workout: FullWorkoutWithMesoData };
	let { workout }: PropsType = $props();
</script>

{#if workout.workoutOfMesocycle && workout.workoutOfMesocycle?.workoutStatus !== null}
	<div class="muted-text-box">
		{convertCamelCaseToNormal(workout.workoutOfMesocycle?.workoutStatus)}
	</div>
{:else}
	<div class="flex h-px grow flex-col gap-1 overflow-y-auto">
		{#each workout.workoutExercises as exercise}
			<WorkoutExerciseCard {exercise} />
		{/each}
	</div>
{/if}
