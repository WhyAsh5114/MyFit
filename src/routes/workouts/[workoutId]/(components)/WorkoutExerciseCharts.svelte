<script lang="ts">
	import { convertCamelCaseToNormal } from '$lib/utils';
	import type { FullWorkoutWithMesoData } from '../+page.server';

	type PropsType = { workout: FullWorkoutWithMesoData };
	let { workout }: PropsType = $props();
</script>

{#if workout.workoutOfMesocycle?.workoutStatus !== null}
	<div class="muted-text-box">
		{convertCamelCaseToNormal(workout.workoutOfMesocycle?.workoutStatus)}
	</div>
{:else}
	TODO: charts
{/if}
