<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { Switch } from '$lib/components/ui/switch';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import type { TodaysWorkoutData } from '$lib/mesoToWorkouts.js';
	import { cn, convertCamelCaseToNormal } from '$lib/utils.js';
	import { onMount } from 'svelte';
	import CheckIcon from 'virtual:icons/lucide/check';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { workoutRunes } from '../workoutRunes.svelte.js';
	import { trpc } from '$lib/trpc/client.js';
	import { toast } from 'svelte-sonner';

	let useActiveMesocycle = $state(false);
	let workoutData: TodaysWorkoutData | 'loading' = $state('loading');
	let userBodyweight: null | number = $state(workoutRunes.workoutData?.userBodyweight ?? null);
	let targetedMuscleGroups = $derived.by(() => {
		let result: string[] = [];
		if (workoutData !== 'loading') {
			result = workoutData.workoutExercises.map((exercise) => {
				return exercise.customMuscleGroup ?? exercise.targetMuscleGroup;
			});
		}
		return Array.from(new Set(result));
	});
	let overwriteWorkoutDialogOpen = $state(false);
	let completingRestDay = $state(false);

	let { data } = $props();
	onMount(async () => {
		workoutData = await data.workoutData;
		userBodyweight = userBodyweight ?? workoutData.userBodyweight;
		if (workoutData.workoutOfMesocycle !== undefined) useActiveMesocycle = true;
	});

	function startWorkout(fromDialog = false, mode: 'keepCurrent' | 'overwrite' = 'overwrite') {
		if (workoutRunes.workoutExercises !== null && !fromDialog) {
			overwriteWorkoutDialogOpen = true;
			return;
		}

		if (workoutData === 'loading') return;
		workoutData.userBodyweight = userBodyweight;

		if (mode === 'overwrite') {
			if (useActiveMesocycle) workoutRunes.workoutData = workoutData;
			else
				workoutRunes.workoutData = {
					...workoutData,
					workoutOfMesocycle: undefined,
					workoutExercises: []
				};
			workoutRunes.workoutExercises = null;
		} else if (workoutRunes.workoutData === null) workoutRunes.workoutData = workoutData;
		workoutRunes.saveStoresToLocalStorage();

		let exercisesLink = `./exercises?userBodyweight=${userBodyweight}`;
		if (useActiveMesocycle) exercisesLink += '&useActiveMesocycle';
		if (mode === 'keepCurrent') exercisesLink += '&keepCurrent';
		goto(exercisesLink);
	}

	async function completeRestDay() {
		completingRestDay = true;
		const { message } = await trpc().workouts.completeRestDay.mutate();
		toast.success(message);
		await invalidate('workouts:start');
		completingRestDay = false;
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
	{#if !(useActiveMesocycle && workoutData.workoutOfMesocycle?.workoutStatus === 'RestDay')}
		<div class="mb-1 flex w-full flex-col gap-1.5 rounded-lg border bg-card p-4">
			<Label for="user-bodyweight">Bodyweight</Label>
			<Input
				type="number"
				id="user-bodyweight"
				placeholder="Type here"
				bind:value={userBodyweight}
			/>
		</div>
	{/if}
	{#if useActiveMesocycle && workoutData.workoutOfMesocycle}
		{@const splitDayName = workoutData.workoutOfMesocycle.splitDayName}
		<Card.Root>
			<Card.Header>
				<Card.Title class={cn({ 'text-primary': splitDayName === '' })}>
					{splitDayName === '' ? 'Rest' : splitDayName}
				</Card.Title>
				<Card.Description class="pb-1">
					Day {workoutData.workoutOfMesocycle.dayNumber}, Cycle {workoutData.workoutOfMesocycle
						.cycleNumber}
				</Card.Description>
				<div class="flex flex-wrap gap-1">
					{#each targetedMuscleGroups as muscleGroup}
						<Badge variant="secondary">{convertCamelCaseToNormal(muscleGroup)}</Badge>
					{/each}
				</div>
			</Card.Header>
			{#if workoutData.workoutOfMesocycle.workoutStatus === 'RestDay'}
				<Card.Footer>
					<Button class="ml-auto w-32 gap-2" onclick={completeRestDay} disabled={completingRestDay}>
						{#if completingRestDay}
							<LoaderCircle class="animate-spin" />
						{:else}
							Complete
							<CheckIcon />
						{/if}
					</Button>
				</Card.Footer>
			{/if}
		</Card.Root>
	{/if}
	<Button class="mt-auto" onclick={() => startWorkout()} disabled={userBodyweight === null}>
		Next
	</Button>
{/if}

<ResponsiveDialog title="Warning" needTrigger={false} bind:open={overwriteWorkoutDialogOpen}>
	<p>
		A workout is already in progress with <span class="font-semibold"
			>{workoutRunes.workoutExercises?.length} exercises</span
		>, do you want to overwrite it?
	</p>
	<div class="grid grid-cols-2 gap-1.5">
		<Button onclick={() => startWorkout(true, 'keepCurrent')}>Keep current</Button>
		<Button variant="destructive" onclick={() => startWorkout(true, 'overwrite')}>Overwrite</Button>
	</div>
</ResponsiveDialog>
