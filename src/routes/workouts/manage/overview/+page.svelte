<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { trpc } from '$lib/trpc/client';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { workoutRunes } from '../workoutRunes.svelte';
	import type { WorkoutExerciseInProgress } from '$lib/utils/workoutUtils';
	import { goto, invalidate } from '$app/navigation';
	import type { RouterInputs } from '$lib/trpc/router';
	import * as Tabs from '$lib/components/ui/tabs';
	import ExerciseSplitExercisesCharts from '../../../exercise-splits/(components)/ExerciseSplitExercisesCharts.svelte';
	import { TRPCClientError } from '@trpc/client';
	import { mesocycleExerciseSplitRunes } from '../../../mesocycles/[mesocycleId]/edit-split/mesocycleExerciseSplitRunes.svelte';

	let savingWorkout = $state(false);
	let workoutExercises = $derived(workoutRunes.workoutExercises ?? []);

	async function saveWorkout() {
		if (workoutRunes.workoutData === null || workoutRunes.workoutExercises === null) return;
		savingWorkout = true;
		const workoutExercisesSets = workoutRunes.workoutExercises.map((ex) => {
			return ex.sets.map((_set, idx) => {
				const { completed, ...set } = _set;
				if (set.skipped) [set.reps, set.load, set.RIR] = [0, 0, 0];
				return { ...set, setIndex: idx };
			});
		});
		const workoutExercisesMiniSets = workoutExercisesSets.map((sets) => sets.map((set) => set.miniSets));

		if (typeof workoutRunes.workoutData?.userBodyweight !== 'number') {
			toast.error('Invalid user bodyweight at start page');
			return;
		}
		const userBodyweight = workoutRunes.workoutData.userBodyweight;

		const createData: RouterInputs['workouts']['create'] = {
			workoutData: { ...workoutRunes.workoutData, userBodyweight },
			workoutExercises: workoutRunes.workoutExercises.map((ex, idx) => {
				const { sets, ...exercise } = ex;
				return { ...exercise, exerciseIndex: idx };
			}),
			workoutExercisesSets: workoutExercisesSets.map((sets) =>
				sets.map((set) => {
					const { miniSets, ...rest } = set;
					if (rest.reps === undefined || rest.load === undefined || rest.RIR === undefined) {
						throw new Error('Rep, Load, or RIR is undefined');
					}
					return {
						...rest,
						reps: rest.reps as number,
						load: rest.load as number,
						RIR: rest.RIR as number
					};
				})
			),
			workoutExercisesMiniSets: workoutExercisesMiniSets.map((sets, exerciseIndex) =>
				sets.map((miniSets, setIndex) =>
					miniSets.map((_miniSet, miniSetIndex) => {
						const exercises = workoutRunes.workoutExercises as WorkoutExerciseInProgress[];
						const { completed, ...miniSet } = _miniSet;
						if (exercises[exerciseIndex].sets[setIndex].skipped) [miniSet.reps, miniSet.load, miniSet.RIR] = [0, 0, 0];

						if (miniSet.reps === undefined || miniSet.load === undefined || miniSet.RIR === undefined) {
							throw new Error('Rep, Load, or RIR is undefined');
						}
						return {
							...miniSet,
							reps: miniSet.reps as number,
							load: miniSet.load as number,
							RIR: miniSet.RIR as number,
							miniSetIndex
						};
					})
				)
			)
		};

		try {
			let message, mesocycleCompleted;
			if (workoutRunes.editingWorkoutId === null) {
				({ message, mesocycleCompleted } = await trpc().workouts.create.mutate(createData));
			} else {
				message = (
					await trpc().workouts.editById.mutate({
						id: workoutRunes.editingWorkoutId,
						endedAt: workoutRunes.workoutData.endedAt as Date | string,
						data: createData
					})
				).message;
			}
			toast.success(message);
			await invalidate('workouts:all');
			workoutRunes.resetStores();
			// Reset meso editing store as it won't change if workout affects meso split days and same mesocycle gets edited
			// 1. User attempts active meso edit but doesn't complete it (stores save meso data)
			// 2. User performs workouts affecting the meso split structure
			// 3. User tries to update meso again, but sees old data as it didn't sync the new changes from workouts
			// So to prevent this from happening, just reset the meso split runes after a workout is completed
			mesocycleExerciseSplitRunes.resetStores();

			if (mesocycleCompleted) {
				await goto(`/mesocycles/${workoutRunes.workoutData.workoutOfMesocycle?.mesocycle.id}?completion`);
			} else {
				await goto('/workouts');
			}
		} catch (error) {
			if (error instanceof TRPCClientError) toast.error(error.message);
		}
		savingWorkout = false;
	}
</script>

<H3>Overview</H3>

<Tabs.Root class="w-full" value="progression">
	<Tabs.List class="grid grid-cols-2">
		<Tabs.Trigger value="progression">Progression</Tabs.Trigger>
		<Tabs.Trigger value="basic">Basic</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="progression">TODO: what to even put here? do we even need this?</Tabs.Content>
	<Tabs.Content class="rounded-md border bg-card p-4" value="basic">
		<ExerciseSplitExercisesCharts exercises={workoutExercises} />
	</Tabs.Content>
</Tabs.Root>

<div class="mt-auto grid grid-cols-2 gap-1">
	<Button onclick={() => window.history.back()} variant="secondary">Previous</Button>
	<Button disabled={savingWorkout} onclick={saveWorkout}>
		{#if savingWorkout}
			<LoaderCircle class="animate-spin" />
		{:else}
			Save
		{/if}
	</Button>
</div>
