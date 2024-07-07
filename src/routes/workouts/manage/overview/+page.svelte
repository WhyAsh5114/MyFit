<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { trpc } from '$lib/trpc/client';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { workoutRunes } from '../workoutRunes.svelte';
	import type { WorkoutExerciseInProgress } from '$lib/workoutFunctions';
	import { goto, invalidate } from '$app/navigation';

	let savingWorkout = $state(false);

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
		const workoutExercisesMiniSets = workoutExercisesSets.map((sets) =>
			sets.map((set) => set.miniSets)
		);

		if (typeof workoutRunes.workoutData?.userBodyweight !== 'number') {
			toast.error('Invalid user bodyweight at start page');
			return;
		}
		const userBodyweight = workoutRunes.workoutData.userBodyweight;

		const { message } = await trpc().workouts.createWorkout.mutate({
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
						if (exercises[exerciseIndex].sets[setIndex].skipped)
							[miniSet.reps, miniSet.load, miniSet.RIR] = [0, 0, 0];

						if (
							miniSet.reps === undefined ||
							miniSet.load === undefined ||
							miniSet.RIR === undefined
						) {
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
		});
		toast.success(message);
		await invalidate('workouts:all');
		await goto('/workouts');
		workoutRunes.resetStores();
		savingWorkout = false;
	}
</script>

<H3>Overview</H3>

<!-- TODO: stuff -->
<div class="mt-auto grid grid-cols-2 gap-1">
	<Button variant="secondary" onclick={() => window.history.back()}>Previous</Button>
	<Button onclick={saveWorkout} disabled={savingWorkout}>
		{#if savingWorkout}
			<LoaderCircle class="animate-spin" />
		{:else}
			Save
		{/if}
	</Button>
</div>
