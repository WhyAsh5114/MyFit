<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { getRIRForWeek } from '$lib/workoutFunctions';
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
			<Card.Title><Skeleton class="text-lg-skeleton" /></Card.Title>
			<Card.Description><Skeleton class="text-base-skeleton" /></Card.Description>
		</Card.Header>
		<Card.Content></Card.Content>
		<Card.Footer>
			<Button class="ml-auto">Start</Button>
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
		{/if}
	{/await}
</Card.Root>
