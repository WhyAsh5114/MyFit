<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Root as Card } from '$lib/components/ui/card';
	import { mesocycleExerciseSplitRunes } from '../mesocycleExerciseSplitRunes.svelte';
	import ExerciseSplitExercisesCharts from '../../../../exercise-splits/(components)/ExerciseSplitExercisesCharts.svelte';
	import ExerciseSplitMuscleGroupsCharts from '../../../../exercise-splits/(components)/ExerciseSplitMuscleGroupsCharts.svelte';
	import MesocycleExerciseSplitVolumeCharts from '../../../(components)/MesocycleExerciseSplitVolumeCharts.svelte';

	function saveMesocycleExerciseSplit() {}
</script>

<H3>Overview</H3>

<Tabs.Root value="volume" class="mb-auto w-full">
	<Tabs.List class="grid grid-cols-3">
		<Tabs.Trigger value="volume">Volume</Tabs.Trigger>
		<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
		<Tabs.Trigger value="muscleGroups">MuscleGroups</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="volume">
		<Card class="p-4">
			<MesocycleExerciseSplitVolumeCharts
				mesocycleSplitExercises={mesocycleExerciseSplitRunes.splitExercises}
			/>
		</Card>
	</Tabs.Content>
	<Tabs.Content value="exercises">
		<Card class="p-4">
			<ExerciseSplitExercisesCharts exercises={mesocycleExerciseSplitRunes.splitExercises.flat()} />
		</Card>
	</Tabs.Content>
	<Tabs.Content value="muscleGroups">
		<Card class="p-4">
			<ExerciseSplitMuscleGroupsCharts
				splitExercises={mesocycleExerciseSplitRunes.splitExercises}
			/>
		</Card>
	</Tabs.Content>
</Tabs.Root>

<div class="mt-2 grid grid-cols-2 gap-1">
	<Button variant="secondary" href="./exercises">Previous</Button>
	<Button onclick={saveMesocycleExerciseSplit}>Save</Button>
</div>
