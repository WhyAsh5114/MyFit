<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import ExerciseTemplateCard from '$lib/components/mesocycleAndExerciseSplit/ExerciseTemplateCard.svelte';
	import { mesocycleExerciseSplitRunes } from '../edit-split/mesocycleExerciseSplitRunes.svelte';
	import { goto } from '$app/navigation';
	import type { RouterOutputs } from '$lib/trpc/router';

	let { mesocycle }: { mesocycle: NonNullable<RouterOutputs['mesocycles']['findById']> } = $props();
	let selectedSplitDay = $state(mesocycle.mesocycleExerciseSplitDays.find((splitDay) => !splitDay.isRestDay)!);

	function editMesocycleExerciseSplit() {
		mesocycleExerciseSplitRunes.loadExerciseSplit(mesocycle);
		goto(`/mesocycles/${mesocycle.id}/edit-split/structure`);
	}
</script>

<Card.Root class="mb-2 flex items-center justify-between gap-2 p-2">
	<span class="text-sm font-medium text-muted-foreground">The current split of the mesocycle</span>
	<Button class="gap-2" onclick={editMesocycleExerciseSplit} size="sm">
		Edit <EditIcon />
	</Button>
</Card.Root>
<Tabs.Root
	class="w-full"
	onValueChange={(v) => {
		selectedSplitDay = mesocycle.mesocycleExerciseSplitDays.find((splitDay) => splitDay.name === v)!;
	}}
	value={selectedSplitDay.name}
>
	<Tabs.List class="flex justify-start overflow-x-auto">
		{#each mesocycle.mesocycleExerciseSplitDays as splitDay}
			<Tabs.Trigger disabled={splitDay.isRestDay} value={splitDay.name}>
				{splitDay.isRestDay ? 'Rest' : splitDay.name}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	<Tabs.Content class="flex flex-col gap-1" value={selectedSplitDay.name}>
		{#each selectedSplitDay.mesocycleSplitDayExercises as exercise}
			<ExerciseTemplateCard context="mesocycle" exerciseTemplate={exercise} readOnly />
		{/each}
	</Tabs.Content>
</Tabs.Root>
