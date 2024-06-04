<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { exerciseSplitRunes } from '../exerciseSplitRunes.svelte';
	import ExerciseSplitExercisesCharts from '../../(components)/ExerciseSplitExercisesCharts.svelte';
	import ExerciseSplitMuscleGroupsCharts from '../../(components)/ExerciseSplitMuscleGroupsCharts.svelte';
	import type { ExerciseSplitRuneDataType } from '../../+page.server';

	let makeExerciseSplitPublic = $state(false);
	let savingExerciseSplit = $state(false);
</script>

<H3>Overview</H3>
<Tabs.Root value="options" class="w-full">
	<Tabs.List class="grid grid-cols-3">
		<Tabs.Trigger value="options">Options</Tabs.Trigger>
		<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
		<Tabs.Trigger value="muscleGroups">Muscle groups</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="options">
		<Card.Root class="p-4">
			<div class="flex items-center justify-between gap-2 space-x-2">
				<Label for="exercise-split-make-public">Make public</Label>
				<Switch
					id="exercise-split-make-public"
					name="exercise-split-make-public"
					bind:checked={makeExerciseSplitPublic}
				/>
			</div>
			<Separator class="my-4" />
			<p class="text-sm text-muted-foreground">
				Makes your split visible to all users of the app. You can share your split ID with your
				friends for quick searching.
				<br /><br />
				Any other user info is not shared. Only you can edit this split, edits will be visible to everyone
				else too.
				<br /><br />
				You can disable this later. If others have used your split before disabling, they will be able
				to continue using it.
			</p>
		</Card.Root>
	</Tabs.Content>
	<Tabs.Content value="exercises">
		<Card.Root class="p-4">
			<ExerciseSplitMuscleGroupsCharts
				exercises={exerciseSplitRunes.splitExercises.flatMap((e) => e)}
			/>
		</Card.Root>
	</Tabs.Content>
	<Tabs.Content value="muscleGroups">
		<Card.Root class="p-4">
			<ExerciseSplitExercisesCharts splitExercises={exerciseSplitRunes.splitExercises} />
		</Card.Root>
	</Tabs.Content>
</Tabs.Root>

<div class="mt-auto grid grid-cols-2 gap-1">
	<Button variant="secondary" href="./exercises">Previous</Button>
	<form
		method="POST"
		class="contents"
		action="/exercise-splits?/create_exercise_split"
		use:enhance={({ formData }) => {
			savingExerciseSplit = true;
			const exerciseSplitRuneData = JSON.stringify({
				splitName: exerciseSplitRunes.splitName,
				splitDays: exerciseSplitRunes.splitDays,
				splitExercises: exerciseSplitRunes.splitExercises,
				makePublic: makeExerciseSplitPublic
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
		<Button class="gap-2" type="submit" disabled={savingExerciseSplit}>
			Save
			{#if savingExerciseSplit}
				<LoaderCircle class="animate-spin" />
			{/if}
		</Button>
	</form>
</div>
