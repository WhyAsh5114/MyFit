<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { onMount } from 'svelte';
	import { workoutRunes } from '../workoutRunes.svelte.js';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let workoutData = $derived(workoutRunes.workoutData);

	onMount(async () => {
		if (workoutRunes.workoutData === null) goto('./start');
		if (workoutRunes.workoutExercises === null)
			workoutRunes.workoutExercises = await data.workoutExercises;
	});
</script>

<H3>Exercises</H3>

{#if workoutData !== null}
	{#if workoutData.workoutOfMesocycle !== undefined}
		<div class="flex items-center justify-between">
			<span class="text-lg font-semibold">
				{workoutData.workoutOfMesocycle.splitDayName}
				<span class="text-base font-normal text-muted-foreground"> </span>
			</span>
			<span class="text-sm font-medium">
				{workoutData.workoutOfMesocycle.mesocycleName}
			</span>
		</div>
		<div class="flex items-center justify-between text-sm text-muted-foreground">
			<span>
				Day {workoutData.workoutOfMesocycle?.dayNumber}, Cycle {workoutData.workoutOfMesocycle
					?.cycleNumber}
			</span>
			<span class="font-medium">
				{workoutData.startedAt.toLocaleString(undefined, {
					month: 'long',
					day: 'numeric'
				})}
			</span>
		</div>
	{:else}
		<span class="text-lg font-semibold">
			{new Date().toLocaleDateString(undefined, { month: 'long', day: '2-digit' })}
		</span>
		<p class="text-sm text-muted-foreground">Without mesocycle</p>
	{/if}
{/if}

{#if workoutRunes.workoutExercises === null}
	TODO: skeletons
{:else}
	<div class="mt-2 flex flex-col">
		{#each workoutRunes.workoutExercises as exercise}
			<span>{exercise.name}</span>
		{/each}
	</div>
{/if}
