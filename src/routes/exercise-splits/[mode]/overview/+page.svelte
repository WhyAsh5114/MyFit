<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import PerDayChartComponent from '../exercises/(components)/PerDayChartComponent.svelte';
	import { exerciseSplitRunes } from '../exerciseSplitRunes.svelte';
	import PerMuscleGroupComponent from '../exercises/(components)/PerMuscleGroupComponent.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { RequestType } from '../../+server';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let callingEndpoint = $state(false);

	async function saveExerciseSplit() {
		callingEndpoint = true;
		const response = await fetch('/exercise-splits', {
			method: 'POST',
			body: JSON.stringify({
				splitName: exerciseSplitRunes.splitName,
				splitDays: exerciseSplitRunes.splitDays,
				splitExercises: exerciseSplitRunes.splitExercises
			} satisfies RequestType)
		});
		callingEndpoint = false;

		if (response.ok) {
			toast.success('Success', { description: await response.text() });
			goto('/exercise-splits');
		} else toast.error('Error', { description: await response.text() });
	}
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
	<Button class="gap-2" onclick={saveExerciseSplit} disabled={callingEndpoint}>
		{#if callingEndpoint}
			<LoaderCircle class="animate-spin" />
		{/if}
		Save
	</Button>
</div>
