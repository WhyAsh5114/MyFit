<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import CloseIcon from 'virtual:icons/lucide/x';
	import type { FullMesocycle } from '../+page.server';
	import type { MesocycleExerciseSplitDay } from '@prisma/client';
	import MesocycleExerciseTemplateCard from './MesocycleExerciseTemplateCard.svelte';

	type MesocycleSplitDay = FullMesocycle['mesocycleExerciseSplitDays'][number];
	let { mesocycle }: { mesocycle: FullMesocycle } = $props();

	let textboxOpen = $state(true);
	let selectedSplitDay = $state(
		mesocycle.mesocycleExerciseSplitDays.find(
			(splitDay) => !splitDay.isRestDay
		) as MesocycleSplitDay
	);
</script>

{#if textboxOpen}
	<div class="muted-text-box mb-2 flex items-center justify-between text-sm">
		The current exercise split for this mesocycle
		<Button
			onclick={() => (textboxOpen = false)}
			variant="ghost"
			size="icon"
			class="h-fit w-fit p-0"
		>
			<CloseIcon />
		</Button>
	</div>
{/if}

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
