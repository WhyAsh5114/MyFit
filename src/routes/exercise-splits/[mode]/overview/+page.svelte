<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { exerciseSplitRunes } from '../exerciseSplitRunes.svelte';
	import PerDayChartComponent from '../exercises/(components)/PerDayChartComponent.svelte';
	import PerMuscleGroupComponent from '../exercises/(components)/PerMuscleGroupComponent.svelte';
	import type { ExerciseSplitRuneDataType } from './+page.server';

	let callingEndpoint = $state(false);
</script>

<H3>Overview</H3>
<Tabs.Root value="Per day" class="w-full">
	<Tabs.List class="grid w-full grid-cols-2">
		<Tabs.Trigger value="Per day">Per day</Tabs.Trigger>
		<Tabs.Trigger value="Per muscle group">Per muscle group</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="Per day">
		<Card.Root class="h-72 p-4">
			<PerDayChartComponent splitExercises={exerciseSplitRunes.splitExercises} />
		</Card.Root>
	</Tabs.Content>
	<Tabs.Content value="Per muscle group">
		<Card.Root class="flex h-80 flex-col gap-2 p-4">
			<PerMuscleGroupComponent splitExercises={exerciseSplitRunes.splitExercises} />
		</Card.Root>
	</Tabs.Content>
</Tabs.Root>

<div class="mt-auto grid grid-cols-2 gap-1">
	<Button variant="secondary" href="./exercises">Previous</Button>
	<form
		method="POST"
		class="contents"
		action="?/create_exercise_split"
		use:enhance={({ formData }) => {
			callingEndpoint = true;
			const exerciseSplitRuneData = JSON.stringify({
				splitName: exerciseSplitRunes.splitName,
				splitDays: exerciseSplitRunes.splitDays,
				splitExercises: exerciseSplitRunes.splitExercises
			} satisfies ExerciseSplitRuneDataType);

			formData.set('exerciseSplitRuneData', exerciseSplitRuneData);
			return async ({ result }) => {
				if (result.type === 'success') {
					toast.success('Success', { description: result.data?.message as string });
					goto('/exercise-splits');
				} else if (result.type === 'failure') {
					toast.error('Error', { description: result.data?.message as string });
				}
			};
		}}
	>
		<Button class="gap-2" type="submit" disabled={callingEndpoint}>
			{#if callingEndpoint}
				<LoaderCircle class="animate-spin" />
			{/if}
			Save
		</Button>
	</form>
</div>
