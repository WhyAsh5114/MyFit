<script lang="ts">
	import { goto } from '$app/navigation';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { getRIRForWeek } from '$lib/utils/workoutUtils';
	import { workoutRunes } from '../../workouts/manage/workoutRunes.svelte';
	import WorkoutProgressionChart from './WorkoutProgressionChart.svelte';
	import ChevronRight from 'virtual:icons/lucide/chevron-right';

	type PropsType = {
		todaysWorkoutData: Promise<RouterOutputs['workouts']['getTodaysWorkoutData']>;
		pastWorkouts: Promise<RouterOutputs['mesocycles']['getWorkouts']>;
	};
	let { todaysWorkoutData, pastWorkouts }: PropsType = $props();

	function createNewWorkout() {
		if (workoutRunes.editingWorkoutId !== null) workoutRunes.resetStores();
		goto('/workouts/manage/start');
	}
</script>

<Card.Root>
	{#await todaysWorkoutData}
		<Card.Header>
			<Card.Title><Skeleton class="card-title-skeleton" /></Card.Title>
			<Card.Description><Skeleton class="card-description-skeleton !w-40" /></Card.Description>
		</Card.Header>
		<Card.Content>
			<Skeleton class="h-20 w-full" />
		</Card.Content>
		<Card.Footer>
			<Skeleton class="button-skeleton ml-auto" />
		</Card.Footer>
	{:then todaysWorkoutData}
		{@const wm = todaysWorkoutData.workoutOfMesocycle}
		{#if wm}
			<Card.Header>
				<Card.Title class="flex items-center justify-between">
					{#if wm.workoutStatus !== 'RestDay'}
						{wm.splitDayName}
						<Badge variant="secondary">{getRIRForWeek(wm.mesocycle.RIRProgression, wm.cycleNumber)} RIR</Badge>
					{:else}
						<span class="text-primary">Rest</span>
					{/if}
				</Card.Title>
				<Card.Description>{wm?.mesocycle.name}</Card.Description>
			</Card.Header>
			{#if wm.workoutStatus !== 'RestDay'}
				<Card.Content>
					{#await pastWorkouts}
						<Skeleton class="h-40 w-full" />
					{:then pastWorkouts}
						<WorkoutProgressionChart {pastWorkouts} />
					{/await}
				</Card.Content>
			{/if}
			<Card.Footer>
				<Button class="ml-auto gap-2" onclick={createNewWorkout}>
					Start
					<ChevronRight />
				</Button>
			</Card.Footer>
		{:else}
			<Card.Header>
				<Card.Title>No workout found</Card.Title>
				<Card.Description>No active mesocycle</Card.Description>
			</Card.Header>
			<Card.Content class="h-20 text-sm leading-snug">
				You can log workouts even without a mesocycle, you'll miss out on automatic progression and mesocycle statistics
			</Card.Content>
			<Card.Footer class="flex flex-col items-end gap-2">
				<Button href="/workouts/manage/start" variant="secondary">Start a workout without mesocycle</Button>
				<Button href="/mesocycles">Go to mesocycles</Button>
			</Card.Footer>
		{/if}
	{/await}
</Card.Root>
