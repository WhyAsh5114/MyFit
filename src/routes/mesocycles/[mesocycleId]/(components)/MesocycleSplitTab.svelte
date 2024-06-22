<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import type { FullMesocycle } from '../+layout.server';
	import MesocycleExerciseTemplateCard from './MesocycleExerciseTemplateCard.svelte';
	import { mesocycleExerciseSplitRunes } from '../edit-split/mesocycleExerciseSplitRunes.svelte';
	import { goto } from '$app/navigation';

	type MesocycleSplitDay = FullMesocycle['mesocycleExerciseSplitDays'][number];
	let { mesocycle }: { mesocycle: FullMesocycle } = $props();

	let selectedSplitDay = $state(
		mesocycle.mesocycleExerciseSplitDays.find(
			(splitDay) => !splitDay.isRestDay
		) as MesocycleSplitDay
	);

	function editMesocycleExerciseSplit() {
		mesocycleExerciseSplitRunes.loadExerciseSplit(mesocycle);
		goto(`/mesocycles/${mesocycle.id}/edit-split/structure`);
	}
</script>

<Card.Root class="mb-2 flex items-center justify-between gap-2 p-2">
	<span class="text-sm font-medium text-muted-foreground">The current split of the mesocycle</span>
	<Button size="sm" class="gap-2" onclick={editMesocycleExerciseSplit}>
		Edit <EditIcon />
	</Button>
</Card.Root>
<Tabs.Root
	value={selectedSplitDay.name}
	onValueChange={(v) => {
		selectedSplitDay = mesocycle.mesocycleExerciseSplitDays.find(
			(splitDay) => splitDay.name === v
		) as MesocycleSplitDay;
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
