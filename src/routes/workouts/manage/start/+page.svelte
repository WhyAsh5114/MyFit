<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Input } from '$lib/components/ui/input';
	import { onMount } from 'svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import type { WorkoutInProgress } from '$lib/mesoToWorkouts.js';
	import * as Card from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';
	import { trpc } from '$lib/trpc/client.js';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { workoutRunes } from '../workoutRunes.svelte.js';

	let useActiveMesocycle = $state(false);
	let workoutData: WorkoutInProgress | 'loading' = $state('loading');
	let userBodyweight: null | number = $state(workoutRunes.workoutData.userBodyweight);
	let updatingUserBodyweight = $state(false);

	let { data } = $props();
	onMount(async () => {
		workoutData = await data.workoutData;
		userBodyweight = workoutData.userBodyweight;
		if (workoutData.workoutOfMesocycle !== undefined) useActiveMesocycle = true;
	});

	function startWorkout() {
		if (workoutData === 'loading') return;
		workoutRunes.workoutData = workoutData;
		goto('./exercises');
	}

	async function updateUserBodyweight(e: SubmitEvent) {
		e.preventDefault();
		if (userBodyweight === null) return;
		updatingUserBodyweight = true;
		workoutData = await trpc().workouts.getTodaysWorkoutData.query({ userBodyweight });
		updatingUserBodyweight = false;
	}
</script>

<H3>Start</H3>

{#if workoutData === 'loading'}
	<Skeleton class="mb-1 h-14 w-full rounded-lg border border-opacity-0" />
{:else if workoutData.workoutOfMesocycle === undefined}
	<div class="mb-1 flex items-center justify-between gap-2 rounded-lg border bg-card p-4">
		<Label for="use-active-mesocycle" class="text-muted-foreground">No active mesocycle</Label>
		<Switch id="use-active-mesocycle" name="use-active-mesocycle" disabled />
	</div>
{:else}
	<div class="mb-1 flex items-center justify-between gap-2 rounded-lg border bg-card p-4">
		<Label for="use-active-mesocycle">Use active mesocycle</Label>
		<Switch
			id="use-active-mesocycle"
			name="use-active-mesocycle"
			bind:checked={useActiveMesocycle}
		/>
	</div>
{/if}

{#if workoutData === 'loading'}
	TODO: skeleton
{:else if useActiveMesocycle && workoutData.workoutOfMesocycle}
	<Card.Root>
		<Card.Header>
			<Card.Title>{workoutData.workoutOfMesocycle.splitDayName}</Card.Title>
			<Card.Description>
				Day {workoutData.workoutOfMesocycle.dayNumber}, Cycle {workoutData.workoutOfMesocycle
					.cycleNumber}
			</Card.Description>
		</Card.Header>
		<form onsubmit={updateUserBodyweight} class="contents">
			{#if workoutData.workoutExercises.some((exercise) => exercise.involvesBodyweight)}
				<Card.Content>
					<div class="flex w-full max-w-sm flex-col gap-1.5">
						<Label for="user-bodyweight">Bodyweight</Label>
						<div class="flex gap-1">
							<Input
								type="number"
								step={0.01}
								id="user-bodyweight"
								placeholder="Type here"
								bind:value={userBodyweight}
							/>
							<Button
								type="submit"
								class="w-20 shrink-0"
								disabled={userBodyweight === workoutData.userBodyweight || updatingUserBodyweight}
							>
								{#if !updatingUserBodyweight}
									Update
								{:else}
									<LoaderCircle class="animate-spin" />
								{/if}
							</Button>
						</div>
					</div>
				</Card.Content>
			{/if}
		</form>
		<Card.Footer>
			TODO <br />
			sets and setChanges <br />
			volumeChanges
		</Card.Footer>
	</Card.Root>
	<Button
		class="mt-auto"
		onclick={startWorkout}
		disabled={userBodyweight !== workoutData.userBodyweight || userBodyweight === null}
	>
		Start workout
	</Button>
{:else}
	<Card.Root>
		<Card.Header>
			<div class="flex w-full max-w-sm flex-col gap-1.5">
				<Label for="user-bodyweight">Bodyweight</Label>
				<Input
					type="number"
					id="user-bodyweight"
					placeholder="Type here"
					bind:value={userBodyweight}
				/>
			</div>
		</Card.Header>
	</Card.Root>
	<Button class="mt-auto" onclick={startWorkout}>Start workout</Button>
{/if}
