<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { getRIRForWeek } from '$lib/utils/workoutUtils';
	import WorkoutProgressionChart from './WorkoutProgressionChart.svelte';
	import ChevronRight from 'virtual:icons/lucide/chevron-right';

	type PropsType = {
		todaysWorkoutData: Promise<RouterOutputs['workouts']['getTodaysWorkoutData']>;
	};
	let { todaysWorkoutData }: PropsType = $props();
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
					{wm?.splitDayName}
					<Badge variant="secondary">{getRIRForWeek(wm?.mesocycle.RIRProgression, wm?.cycleNumber)} RIR</Badge>
				</Card.Title>
				<Card.Description>{wm?.mesocycle.name}</Card.Description>
			</Card.Header>
			<Card.Content>
				<WorkoutProgressionChart workoutOfMesocycle={wm} />
			</Card.Content>
			<Card.Footer>
				<Button class="ml-auto gap-2" href="/workouts/manage/start">
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
