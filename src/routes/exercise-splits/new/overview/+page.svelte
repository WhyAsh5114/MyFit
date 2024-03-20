<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import * as Tabs from '$lib/components/ui/tabs';

	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';
	import { muscleGroups } from '$lib/constants';
	import { exerciseSplitStore } from '../exerciseSplitStore';
	import PerMuscleGroupChartComponent from './(components)/PerMuscleGroupChartComponent.svelte';
	import PerDayChartComponent from './(components)/PerDayChartComponent.svelte';
	import { goto } from '$app/navigation';
	import { Card } from '$lib/components/ui/card';

	const sortedMuscleGroups = muscleGroups.toSorted((a, b) => getTotalVolume(b) - getTotalVolume(a));
	let selectedMuscleGroups = sortedMuscleGroups.slice(0, 3);
	let callingEndpoint = false;

	async function createExerciseSplit() {
		callingEndpoint = true;
		const response = await fetch('/api/exercise-splits', {
			method: 'POST',
			body: JSON.stringify($exerciseSplitStore)
		});
		if (response.ok) {
			toast.success('Success', { description: await response.text() });
			goto('/exercise-splits');
		} else {
			toast.error(`Error ${response.status}`, { description: await response.text() });
		}
		$exerciseSplitStore = {
			name: '',
			splitDays: Array.from({ length: 7 }).map(() => {
				return { name: '', exerciseTemplates: [] };
			})
		};
		callingEndpoint = false;
	}

	function getTotalVolume(muscleGroup: MuscleGroup) {
		return $exerciseSplitStore.splitDays.reduce((totalSets, splitDay) => {
			if (!splitDay) return totalSets;
			return (
				totalSets +
				splitDay.exerciseTemplates.reduce(
					(setsForDay, exercise) =>
						exercise.targetMuscleGroup === muscleGroup ? setsForDay + exercise.sets : setsForDay,
					0
				)
			);
		}, 0);
	}
</script>

<H2>New exercise split</H2>
<H3>Overview</H3>

<Tabs.Root value="/muscleGroup" class="mb-auto w-full">
	<Tabs.List class="grid grid-cols-2">
		<Tabs.Trigger value="/muscleGroup">/muscleGroup</Tabs.Trigger>
		<Tabs.Trigger value="/day">/day</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="/muscleGroup">
		<Card class="p-2">
			<PerMuscleGroupChartComponent {selectedMuscleGroups} />
			<ToggleGroup.Root
				variant="outline"
				type="multiple"
				size="sm"
				class="grid grid-cols-3"
				bind:value={selectedMuscleGroups}
			>
				{#each sortedMuscleGroups as muscleGroup}
					<ToggleGroup.Item class="aria-pressed:bg-foreground" value={muscleGroup}>
						{muscleGroup}
					</ToggleGroup.Item>
				{/each}
			</ToggleGroup.Root>
		</Card>
	</Tabs.Content>
	<Tabs.Content value="/day">
		<Card class="p-2">
			<PerDayChartComponent />
		</Card>
	</Tabs.Content>
</Tabs.Root>

<div class="grid grid-cols-2 gap-1">
	<Button variant="secondary">
		<a href="/exercise-splits/new/exercises" class="w-full">Back</a>
	</Button>
	<Button on:click={createExerciseSplit} disabled={callingEndpoint}>
		{#if callingEndpoint}
			<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
		{/if}
		Save
	</Button>
</div>
