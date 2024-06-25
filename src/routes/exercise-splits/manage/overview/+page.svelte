<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { exerciseSplitRunes } from '../exerciseSplitRunes.svelte';
	import ExerciseSplitMuscleGroupsCharts from '../../(components)/ExerciseSplitMuscleGroupsCharts.svelte';
	import ExerciseSplitExercisesCharts from '../../(components)/ExerciseSplitExercisesCharts.svelte';
	import { trpc } from '$lib/trpc/client';
	import { TRPCClientError } from '@trpc/client';

	let savingExerciseSplit = $state(false);

	async function createOrEditExerciseSplit() {
		const id = exerciseSplitRunes.editingExerciseSplitId;
		savingExerciseSplit = true;
		if (id) await editExerciseSplit(id);
		else await createExerciseSplit();

		await invalidate('exerciseSplits:all');
		await goto('/exercise-splits');
		savingExerciseSplit = false;
		exerciseSplitRunes.resetStores();
	}

	async function createExerciseSplit() {
		try {
			const { message } = await trpc().exerciseSplits.create.mutate({
				splitName: exerciseSplitRunes.splitName,
				splitDays: exerciseSplitRunes.splitDays.map((splitDay, idx) => ({
					...splitDay,
					dayIndex: idx
				})),
				splitExercises: exerciseSplitRunes.splitExercises.map((dayExercises) =>
					dayExercises.map((exercise, idx) => ({ ...exercise, exerciseIndex: idx }))
				)
			});
			toast.success(message);
		} catch (error) {
			if (error instanceof TRPCClientError) toast.error(error.message);
		}
	}

	async function editExerciseSplit(id: string) {
		try {
			const { message } = await trpc().exerciseSplits.editById.mutate({
				id,
				splitData: {
					splitName: exerciseSplitRunes.splitName,
					splitDays: exerciseSplitRunes.splitDays.map((splitDay, idx) => ({
						...splitDay,
						dayIndex: idx
					})),
					splitExercises: exerciseSplitRunes.splitExercises.map((dayExercises) =>
						dayExercises.map((exercise, idx) => ({ ...exercise, exerciseIndex: idx }))
					)
				}
			});
			toast.success(message);
		} catch (error) {
			if (error instanceof TRPCClientError) toast.error(error.message);
		}
	}
</script>

<H3>Overview</H3>
<Tabs.Root value="exercises" class="w-full">
	<Tabs.List class="grid grid-cols-2">
		<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
		<Tabs.Trigger value="muscleGroups">Muscle groups</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="exercises">
		<Card.Root class="p-4">
			<ExerciseSplitExercisesCharts exercises={exerciseSplitRunes.splitExercises.flat()} />
		</Card.Root>
	</Tabs.Content>
	<Tabs.Content value="muscleGroups">
		<Card.Root class="p-4">
			<ExerciseSplitMuscleGroupsCharts splitExercises={exerciseSplitRunes.splitExercises} />
		</Card.Root>
	</Tabs.Content>
</Tabs.Root>

<div class="mt-auto grid grid-cols-2 gap-1">
	<Button variant="secondary" href="./exercises">Previous</Button>
	<Button disabled={savingExerciseSplit} onclick={createOrEditExerciseSplit}>
		{#if savingExerciseSplit}
			<LoaderCircle class="animate-spin" />
		{:else}
			Save
		{/if}
	</Button>
</div>
