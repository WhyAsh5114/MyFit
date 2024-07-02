<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { onMount } from 'svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import type { TodaysWorkoutData } from '$lib/mesoToWorkouts.js';
	import * as Card from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';
	import { workoutRunes } from '../workoutRunes.svelte.js';

	let useActiveMesocycle = $state(false);
	let workoutData: TodaysWorkoutData | 'loading' = $state('loading');
	let userBodyweight: null | number = $state(workoutRunes.workoutData.userBodyweight);
	let targetedMuscleGroups = $derived.by(() => {
		let result: string[] = [];
		if (workoutData !== 'loading') {
			result = workoutData.workoutExercises.map((exercise) => {
				return exercise.customMuscleGroup ?? exercise.targetMuscleGroup;
			});
		}
		return Array.from(new Set(result));
	});

	let { data } = $props();
	onMount(async () => {
		workoutData = await data.workoutData;
		userBodyweight = userBodyweight ?? workoutData.userBodyweight;
		if (workoutData.workoutOfMesocycle !== undefined) useActiveMesocycle = true;
	});

	function startWorkout() {
		if (workoutData === 'loading') return;
		workoutData.userBodyweight = userBodyweight;
		workoutRunes.workoutData = workoutData;
		workoutRunes.saveStoresToLocalStorage();
		goto(`./exercises?userBodyweight=${userBodyweight}`);
	}
</script>

<H3>Start</H3>

{#if workoutData === 'loading'}
	<Skeleton class="mb-1 h-14 w-full rounded-lg border border-opacity-0" />
	<Skeleton class="mb-1 h-[96px] w-full" />
	<Skeleton class="h-[166px] w-full" />
	<Skeleton class="mt-auto h-10 w-full" />
{:else}
	<div class="mb-1 flex items-center justify-between gap-2 rounded-lg border bg-card p-4">
		<Label for="use-active-mesocycle">
			{workoutData.workoutOfMesocycle === undefined ? 'No' : 'Use'} active mesocycle
		</Label>
		{#if workoutData.workoutOfMesocycle === undefined}
			<Switch id="use-active-mesocycle" name="use-active-mesocycle" disabled />
		{:else}
			<Switch
				id="use-active-mesocycle"
				name="use-active-mesocycle"
				bind:checked={useActiveMesocycle}
			/>
		{/if}
	</div>
	<div class="mb-1 flex w-full max-w-sm flex-col gap-1.5 rounded-lg border bg-card p-4">
		<Label for="user-bodyweight">Bodyweight</Label>
		<Input type="number" id="user-bodyweight" placeholder="Type here" bind:value={userBodyweight} />
	</div>
	{#if useActiveMesocycle && workoutData.workoutOfMesocycle}
		<Card.Root>
			<Card.Header>
				<Card.Title>{workoutData.workoutOfMesocycle.splitDayName}</Card.Title>
				<Card.Description class="pb-1">
					Day {workoutData.workoutOfMesocycle.dayNumber}, Cycle {workoutData.workoutOfMesocycle
						.cycleNumber}
				</Card.Description>
				<div class="flex flex-wrap gap-1">
					{#each targetedMuscleGroups as muscleGroup}
						<Badge variant="secondary">{muscleGroup}</Badge>
					{/each}
				</div>
			</Card.Header>
		</Card.Root>
	{/if}
	<Button class="mt-auto" onclick={startWorkout} disabled={userBodyweight === null}>
		Start workout
	</Button>
{/if}
