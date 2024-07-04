<script lang="ts">
	import type { WorkoutExerciseInProgress } from '$lib/mesoToWorkouts';
	import StraightSetsComponent from './StraightSetsComponent.svelte';

	type PropsType = { reordering: boolean; exercise: WorkoutExerciseInProgress };
	let { reordering, exercise = $bindable() }: PropsType = $props();

	let typeToComponent = [{ setType: 'Straight', component: StraightSetsComponent }];
	let selected = $derived(typeToComponent.find((e) => e.setType === exercise.setType));
</script>

{#if selected}
	<svelte:component this={selected.component} {reordering} bind:exercise />
{/if}
