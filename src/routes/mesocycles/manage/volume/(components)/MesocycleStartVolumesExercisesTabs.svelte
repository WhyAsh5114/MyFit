<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import MesocycleStartVolumesExerciseTemplateCard from './MesocycleStartVolumesExerciseTemplateCard.svelte';
	import { mesocycleRunes } from '../../mesocycleRunes.svelte';
	import type { FullExerciseSplit } from '../../../../exercise-splits/manage/exerciseSplitRunes.svelte';

	const exerciseSplit = mesocycleRunes.selectedExerciseSplit as FullExerciseSplit;
	let selectedSplitDayIndex = $state(
		exerciseSplit.exerciseSplitDays.findIndex((splitDay) => !splitDay.isRestDay)
	);
	let selectedSplitDayName = $derived(exerciseSplit.exerciseSplitDays[selectedSplitDayIndex].name);
</script>

<Tabs.Root
	value={selectedSplitDayName}
	class="flex h-full w-full flex-col"
	onValueChange={(value) => {
		selectedSplitDayIndex = exerciseSplit.exerciseSplitDays.findIndex(
			(splitDay) => splitDay.name === value
		);
	}}
>
	<Tabs.List class="flex justify-start overflow-x-auto">
		{#each exerciseSplit.exerciseSplitDays as splitDay}
			<Tabs.Trigger value={splitDay.name} disabled={splitDay.isRestDay}>
				{splitDay.isRestDay ? 'Rest' : splitDay.name}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	<Tabs.Content value={selectedSplitDayName} class="flex h-px grow flex-col gap-1 overflow-y-auto">
		{#if mesocycleRunes.mesocycleExerciseTemplates}
			{#each mesocycleRunes.mesocycleExerciseTemplates[selectedSplitDayIndex] as _, idx}
				<MesocycleStartVolumesExerciseTemplateCard
					bind:exerciseTemplate={mesocycleRunes.mesocycleExerciseTemplates[selectedSplitDayIndex][
						idx
					]}
				/>
			{/each}
		{/if}
	</Tabs.Content>
</Tabs.Root>
