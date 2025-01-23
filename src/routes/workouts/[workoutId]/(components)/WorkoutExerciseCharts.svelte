<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import type { FullWorkoutWithMesoData } from '../+page.server';
	import ExerciseSplitExercisesCharts from '../../../exercise-splits/(components)/ExerciseSplitExercisesCharts.svelte';

	type PropsType = { workout: FullWorkoutWithMesoData };
	let { workout }: PropsType = $props();
</script>

{#if typeof workout.workoutOfMesocycle?.workoutStatus === 'string'}
	<div class="muted-text-box">
		{convertCamelCaseToNormal(workout.workoutOfMesocycle?.workoutStatus)}
	</div>
{:else}
	<Card.Root class="p-4">
		<ExerciseSplitExercisesCharts exercises={workout.workoutExercises} />
	</Card.Root>
{/if}
