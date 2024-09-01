<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import type { RouterOutputs } from '$lib/trpc/router';

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
		<Card.Header>
			<Card.Title>
				{wm?.splitDayName}
			</Card.Title>
			<Card.Description>{wm?.mesocycle.name}</Card.Description>
		</Card.Header>
		<Card.Content></Card.Content>
		<Card.Footer>
			<Button class="ml-auto">Start</Button>
		</Card.Footer>
	{/await}
</Card.Root>
