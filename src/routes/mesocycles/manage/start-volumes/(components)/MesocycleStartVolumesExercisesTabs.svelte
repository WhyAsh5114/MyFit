<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import MesocycleStartVolumesExerciseTemplateCard from './MesocycleStartVolumesExerciseTemplateCard.svelte';
	import type { MesocycleExerciseTemplateWithoutIDs } from '../../mesocycleRunes.svelte';
	import type { FullExerciseSplit } from '../../../../exercise-splits/manage/exerciseSplitRunes.svelte';

	type PropsType = {
		mesocycleExerciseTemplates: MesocycleExerciseTemplateWithoutIDs[][];
		exerciseSplit: FullExerciseSplit;
	};

	let { mesocycleExerciseTemplates = $bindable(), exerciseSplit }: PropsType = $props();
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
		{#each mesocycleExerciseTemplates[selectedSplitDayIndex] as _, idx}
			<MesocycleStartVolumesExerciseTemplateCard
				bind:exerciseTemplate={mesocycleExerciseTemplates[selectedSplitDayIndex][idx]}
			/>
		{/each}
	</Tabs.Content>
</Tabs.Root>
