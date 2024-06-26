<script lang="ts">
	import type { MesocycleExerciseTemplateWithoutIdsOrIndex } from '$lib/components/mesocycleAndExerciseSplit/commonTypes';
	import { Root as Card } from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import MesocycleExerciseSplitVolumeCharts from '../../(components)/MesocycleExerciseSplitVolumeCharts.svelte';
	import ExerciseSplitExercisesCharts from '../../../exercise-splits/(components)/ExerciseSplitExercisesCharts.svelte';
	import ExerciseSplitMuscleGroupsCharts from '../../../exercise-splits/(components)/ExerciseSplitMuscleGroupsCharts.svelte';

	type PropsType = { splitExercises: MesocycleExerciseTemplateWithoutIdsOrIndex[][] };
	let { splitExercises }: PropsType = $props();
</script>

<Tabs.Root value="volume" class="mb-auto w-full">
	<Tabs.List class="grid grid-cols-3">
		<Tabs.Trigger value="volume">Volume</Tabs.Trigger>
		<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
		<Tabs.Trigger value="muscleGroups">MuscleGroups</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="volume">
		<Card class="p-4">
			<MesocycleExerciseSplitVolumeCharts mesocycleSplitExercises={splitExercises} />
		</Card>
	</Tabs.Content>
	<Tabs.Content value="exercises">
		<Card class="p-4">
			<ExerciseSplitExercisesCharts exercises={splitExercises.flat()} />
		</Card>
	</Tabs.Content>
	<Tabs.Content value="muscleGroups">
		<Card class="p-4">
			<ExerciseSplitMuscleGroupsCharts {splitExercises} />
		</Card>
	</Tabs.Content>
</Tabs.Root>
