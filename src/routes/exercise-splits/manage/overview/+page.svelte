<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { exerciseSplitRunes } from '../exerciseSplitRunes.svelte';
	import ExerciseSplitMuscleGroupsCharts from '../../(components)/ExerciseSplitMuscleGroupsCharts.svelte';
	import ExerciseSplitExercisesCharts from '../../(components)/ExerciseSplitExercisesCharts.svelte';
	import type { ExerciseSplitRuneDataType } from '../../+page.server';

	let savingExerciseSplit = $state(false);
</script>

<H3>Overview</H3>
<Tabs.Root value="exercises" class="w-full">
	<Tabs.List class="grid grid-cols-2">
		<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
		<Tabs.Trigger value="muscleGroups">Muscle groups</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="exercises">
		<Card.Root class="p-4">
			<ExerciseSplitExercisesCharts
				exercises={exerciseSplitRunes.splitExercises.flatMap((e) => e)}
			/>
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
	<form
		method="POST"
		class="contents"
		action={exerciseSplitRunes.editingExerciseSplitId
			? `/exercise-splits/${exerciseSplitRunes.editingExerciseSplitId}?/edit_exercise_split`
			: '/exercise-splits?/create_exercise_split'}
		use:enhance={({ formData }) => {
			savingExerciseSplit = true;
			const exerciseSplitRuneData = JSON.stringify({
				splitName: exerciseSplitRunes.splitName,
				splitDays: exerciseSplitRunes.splitDays,
				splitExercises: exerciseSplitRunes.splitExercises
			} satisfies ExerciseSplitRuneDataType);

			formData.set('exerciseSplitRuneData', exerciseSplitRuneData);
			return async ({ result }) => {
				if (result.type === 'success') {
					toast.success(result.data?.message as string);
					await goto('/exercise-splits');
					exerciseSplitRunes.resetStores();
				} else if (result.type === 'failure') {
					toast.error(result.data?.message as string);
				}
			};
		}}
	>
		<Button type="submit" disabled={savingExerciseSplit}>
			{#if savingExerciseSplit}
				<LoaderCircle class="animate-spin" />
			{:else}
				Save
			{/if}
		</Button>
	</form>
</div>
