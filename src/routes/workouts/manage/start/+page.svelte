<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { onMount } from 'svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import type { WorkoutExerciseInProgress } from '$lib/mesoToWorkouts.js';

	let useActiveMesocycle = $state(false);
	let workoutExercises: 'RestDay' | WorkoutExerciseInProgress[] | null | 'loading' =
		$state('loading');

	let { data } = $props();
	onMount(async () => {
		workoutExercises = await data.workoutExercises;
		if (workoutExercises !== null) useActiveMesocycle = true;
		console.log($state.snapshot(workoutExercises));
	});
</script>

<H3>Start</H3>

{#if workoutExercises === 'loading'}
	<Skeleton class="h-14 w-full rounded-md border border-opacity-0" />
{:else if workoutExercises === null}
	<div class="flex items-center justify-between gap-2 rounded-md border bg-card p-4">
		<Label for="use-active-mesocycle" class="text-muted-foreground">No active mesocycle</Label>
		<Switch id="use-active-mesocycle" name="use-active-mesocycle" disabled />
	</div>
{:else}
	<div class="flex items-center justify-between gap-2 rounded-md border bg-card p-4">
		<Label for="use-active-mesocycle">Use active mesocycle</Label>
		<Switch
			id="use-active-mesocycle"
			name="use-active-mesocycle"
			bind:checked={useActiveMesocycle}
		/>
	</div>
{/if}

{#if workoutExercises === 'loading'}
	TODO: skeleton
{:else if useActiveMesocycle}
	TODO: use active meso
{:else}
	TODO: don't use active meso
{/if}
