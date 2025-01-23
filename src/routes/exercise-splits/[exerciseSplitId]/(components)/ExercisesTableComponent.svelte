<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { ExerciseSplitDay, ExerciseTemplate } from '@prisma/client';
	import ExerciseTemplateCard from '$lib/components/mesocycleAndExerciseSplit/ExerciseTemplateCard.svelte';

	type PropsType = { exerciseSplitDays: (ExerciseSplitDay & { exercises: ExerciseTemplate[] })[] };
	let { exerciseSplitDays }: PropsType = $props();

	let selectedDayIndex = $state(exerciseSplitDays.findIndex((splitDay) => splitDay !== null).toString());
	let selectedSplitDay = $derived(exerciseSplitDays[parseInt(selectedDayIndex)]);
</script>

<Tabs.Root class="flex h-full flex-col" bind:value={selectedDayIndex}>
	<Tabs.List class="w-full shrink-0 justify-start overflow-x-auto">
		{#each exerciseSplitDays as splitDay, i}
			<Tabs.Trigger class="shrink-0 grow basis-20" disabled={splitDay.isRestDay} value={i.toString()}>
				{splitDay.isRestDay ? 'Rest' : splitDay.name}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	{#if selectedSplitDay}
		<Card.Root class="mt-2 flex h-px grow flex-col overflow-y-auto border-none bg-background">
			<div class="flex items-center gap-3">
				<div class="mr-auto flex flex-col">
					<span class="truncate text-lg font-semibold">{selectedSplitDay.name}</span>
					<span class="font-sembold text-sm text-muted-foreground">
						Day {parseInt(selectedDayIndex) + 1}
					</span>
				</div>
			</div>
			<div class="mt-2 flex h-full flex-col gap-1 overflow-y-auto">
				{#each selectedSplitDay.exercises as exercise}
					<ExerciseTemplateCard context="exerciseSplit" exerciseTemplate={exercise} readOnly />
				{/each}
			</div>
		</Card.Root>
	{/if}
</Tabs.Root>
