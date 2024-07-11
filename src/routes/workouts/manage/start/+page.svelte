<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { navigating } from '$app/stores';
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { Switch } from '$lib/components/ui/switch';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { trpc } from '$lib/trpc/client.js';
	import { cn, convertCamelCaseToNormal } from '$lib/utils.js';
	import type { TodaysWorkoutData } from '$lib/workoutFunctions.js';
	import { toast } from 'svelte-sonner';
	import CheckIcon from 'virtual:icons/lucide/check';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { workoutRunes } from '../workoutRunes.svelte.js';
	import type { WorkoutStatus } from '@prisma/client';
	import SkipIcon from 'virtual:icons/lucide/skip-forward';

	let { data } = $props();

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
	let completingWorkout = $state(false);

	$effect(() => {
		data.workoutData.then((data) => {
			if (workoutRunes.editingWorkoutId === null) workoutData = data;
			else workoutData = workoutRunes.workoutData as TodaysWorkoutData;

			userBodyweight = userBodyweight ?? workoutData.userBodyweight;
			if (workoutData.workoutOfMesocycle !== undefined) useActiveMesocycle = true;
		});
	});

	async function startWorkout(fromDialog = false, mode: 'keepCurrent' | 'overwrite' = 'overwrite') {
		if (workoutRunes.editingWorkoutId) {
			if (workoutRunes.workoutData) workoutRunes.workoutData.userBodyweight = userBodyweight;
			workoutRunes.saveStoresToLocalStorage();
			await goto('./exercises?editing');
			return;
		}

		if (workoutRunes.workoutExercises !== null && !fromDialog) {
			overwriteWorkoutDialogOpen = true;
			return;
		}
		overwriteWorkoutDialogOpen = false;

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

		const workoutOfMesocycle = workoutRunes.workoutData.workoutOfMesocycle;
		let exercisesLink = `./exercises?userBodyweight=${userBodyweight}`;
		if (useActiveMesocycle) exercisesLink += '&useActiveMesocycle';
		if (mode === 'keepCurrent') exercisesLink += '&keepCurrent';
		if (workoutOfMesocycle) exercisesLink += `&splitDayIndex=${workoutOfMesocycle.splitDayIndex}`;
		goto(exercisesLink);
	}

	async function completeWorkout(workoutStatus: WorkoutStatus) {
		if (workoutData === 'loading') return;
		if (typeof userBodyweight !== 'number') {
			toast.error('Enter your bodyweight');
			return;
		}
		completingWorkout = true;
		const { message } = await trpc().workouts.completeWorkoutWithoutExercises.mutate({
			splitDayIndex: workoutData.workoutOfMesocycle?.splitDayIndex as number,
			mesocycleId: workoutData.workoutOfMesocycle?.mesocycle.id as string,
			userBodyweight,
			workoutStatus
		});
		toast.success(message);
		await invalidate('workouts:start');
		completingWorkout = false;
	}
</script>

<H3>Start</H3>

{#if workoutData === 'loading'}
	<Skeleton class="mb-1 h-14 w-full rounded-lg border border-opacity-0" />
	<Skeleton class="mb-1 h-[96px] w-full" />
	<Skeleton class="h-[166px] w-full" />
	<Skeleton class="mt-auto h-10 w-full" />
{:else}
	{#if workoutRunes.editingWorkoutId === null}
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
	{/if}
	{#if !(useActiveMesocycle && workoutData.workoutOfMesocycle?.workoutStatus === 'RestDay')}
		<div class="mb-1 flex w-full flex-col gap-1.5 rounded-lg border bg-card p-4">
			<Label for="user-bodyweight">Bodyweight</Label>
			<Input
				id="user-bodyweight"
				placeholder="Type here"
				type="number"
				bind:value={userBodyweight}
			/>
		</div>
	{/if}
	{#if useActiveMesocycle && workoutData.workoutOfMesocycle}
		{@const workoutStatus = workoutData.workoutOfMesocycle.workoutStatus}
		{@const splitDayName = workoutData.workoutOfMesocycle.splitDayName}
		<Card.Root>
			<Card.Header>
				<Card.Title class={cn({ 'text-primary': splitDayName === '' })}>
					{splitDayName === '' ? 'Rest' : splitDayName}
				</Card.Title>
				<Card.Description class="pb-1">
					Day {workoutData.workoutOfMesocycle.splitDayIndex + 1}, Cycle {workoutData
						.workoutOfMesocycle.cycleNumber}
				</Card.Description>
				<div class="flex flex-wrap gap-1">
					{#each targetedMuscleGroups as muscleGroup}
						<Badge variant="secondary">{convertCamelCaseToNormal(muscleGroup)}</Badge>
					{/each}
				</div>
			</Card.Header>
			<Card.Footer>
				<Button
					class="ml-auto w-32 gap-2"
					disabled={completingWorkout}
					onclick={() => completeWorkout(workoutStatus === 'RestDay' ? 'RestDay' : 'Skipped')}
				>
					{#if completingWorkout}
						<LoaderCircle class="animate-spin" />
					{:else}
						{workoutStatus === 'RestDay' ? 'Complete' : 'Skip'}
						{#if workoutStatus === 'RestDay'}
							<CheckIcon />
						{:else}
							<SkipIcon />
						{/if}
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	{/if}
	{#if workoutData.workoutOfMesocycle?.workoutStatus !== 'RestDay'}
		<Button
			class="mt-auto"
			disabled={userBodyweight === null || $navigating !== null}
			onclick={() => startWorkout()}
		>
			{#if $navigating}
				<LoaderCircle class="animate-spin" />
			{:else}
				Next
			{/if}
		</Button>
	{/if}
{/if}

<ResponsiveDialog needTrigger={false} title="Warning" bind:open={overwriteWorkoutDialogOpen}>
	<p>
		A workout is already in progress with <span class="font-semibold"
			>{workoutRunes.workoutExercises?.length} exercises</span
		>, do you want to overwrite it?
	</p>
	<div class="grid grid-cols-2 gap-1.5">
		<Button onclick={() => startWorkout(true, 'keepCurrent')}>Keep current</Button>
		<Button onclick={() => startWorkout(true, 'overwrite')} variant="destructive">Overwrite</Button>
	</div>
</ResponsiveDialog>
