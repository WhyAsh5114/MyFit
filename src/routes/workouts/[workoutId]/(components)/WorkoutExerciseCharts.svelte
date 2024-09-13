<script lang="ts">
	import { convertCamelCaseToNormal } from '$lib/utils';
	import type { FullWorkoutWithMesoData } from '../+page.server';

	type PropsType = { workout: FullWorkoutWithMesoData };
	let { workout }: PropsType = $props();
</script>

{#if typeof workout.workoutOfMesocycle?.workoutStatus === 'string'}
	<div class="muted-text-box">
		{convertCamelCaseToNormal(workout.workoutOfMesocycle?.workoutStatus)}
	</div>
{:else}
	<!-- #86 -->
{/if}
