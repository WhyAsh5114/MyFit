<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import type { FullMesocycle } from '../+page.server';
	import MesocycleExerciseTemplateCard from './MesocycleExerciseTemplateCard.svelte';

	type MesocycleSplitDay = FullMesocycle['mesocycleExerciseSplitDays'][number];
	let { mesocycle }: { mesocycle: FullMesocycle } = $props();

	let selectedSplitDay = $state(
		mesocycle.mesocycleExerciseSplitDays.find(
			(splitDay) => !splitDay.isRestDay
		) as MesocycleSplitDay
	);
</script>

<Tabs.Root
	value={selectedSplitDay.name}
	onValueChange={(v) => {
		selectedSplitDay = mesocycle.mesocycleExerciseSplitDays.find((splitDay) => splitDay.name === v) as MesocycleSplitDay;
	}}
	class="w-full"
>
	<Tabs.List class="flex justify-start overflow-x-auto">
		{#each mesocycle.mesocycleExerciseSplitDays as splitDay}
			<Tabs.Trigger value={splitDay.name} disabled={splitDay.isRestDay}>
				{splitDay.isRestDay ? 'Rest' : splitDay.name}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	<Tabs.Content value={selectedSplitDay.name} class="flex flex-col gap-1">
		{#each selectedSplitDay.mesocycleSplitDayExercises as exercise}
			<MesocycleExerciseTemplateCard exerciseTemplate={exercise} />
		{/each}
	</Tabs.Content>
</Tabs.Root>
