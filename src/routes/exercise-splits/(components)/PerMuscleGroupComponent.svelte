<script lang="ts">
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { muscleGroups } from '$lib/constants';
	import PerMuscleGroupChartComponent from './PerMuscleGroupChartComponent.svelte';
	export let splitDays: ExerciseSplit['splitDays'];

	const sortedMuscleGroups = muscleGroups.toSorted((a, b) => getTotalVolume(b) - getTotalVolume(a));
	let selectedMuscleGroups = sortedMuscleGroups.slice(0, 3);

	function getTotalVolume(muscleGroup: MuscleGroup) {
		return splitDays.reduce((totalSets, splitDay) => {
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

<PerMuscleGroupChartComponent {splitDays} {selectedMuscleGroups} />
<ToggleGroup.Root
	variant="outline"
	type="multiple"
	size="sm"
	class="grid grid-cols-3"
	bind:value={selectedMuscleGroups}
>
	{#each sortedMuscleGroups as muscleGroup}
		<ToggleGroup.Item value={muscleGroup}>
			{muscleGroup}
		</ToggleGroup.Item>
	{/each}
</ToggleGroup.Root>
