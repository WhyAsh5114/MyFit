<script lang="ts">
	import type { WorkoutExerciseInProgress } from '$lib/mesoToWorkouts';
	import StraightSetsComponent from './(componentsForVariousSets)/StraightSetsComponent.svelte';
	import V2SetsComponent from './(componentsForVariousSets)/V2SetsComponent.svelte';

	type PropsType = { reordering: boolean; exercise: WorkoutExerciseInProgress };
	let { reordering, exercise = $bindable() }: PropsType = $props();

	let typeToComponent = [
		{ setType: 'Straight', component: StraightSetsComponent },
		{ setType: 'V2', component: V2SetsComponent }
	];
	let selected = $derived(typeToComponent.find((e) => e.setType === exercise.setType));
</script>

{#if selected}
	<svelte:component this={selected.component} {reordering} bind:exercise />
{/if}
