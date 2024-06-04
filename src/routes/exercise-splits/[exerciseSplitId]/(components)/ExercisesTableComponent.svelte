<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { ExerciseSplitDay, ExerciseTemplate } from '@prisma/client';
	import ExerciseTemplateCard from '../../(components)/ExerciseTemplateCard.svelte';

	type PropsType = { exerciseSplitDays: (ExerciseSplitDay & { exercises: ExerciseTemplate[] })[] };
	let { exerciseSplitDays }: PropsType = $props();

	let selectedDayIndex = $state(
		exerciseSplitDays.findIndex((splitDay) => splitDay !== null).toString()
	);
	let selectedSplitDay = $derived(exerciseSplitDays[parseInt(selectedDayIndex)]);

	const emptyFunctions = {
		openEditExercise: () => {},
		deleteExercise: () => {}
	};
</script>

<Tabs.Root bind:value={selectedDayIndex} class="flex h-full flex-col">
	<Tabs.List class="w-full shrink-0 justify-start overflow-x-auto">
		{#each exerciseSplitDays as splitDay, i}
			<Tabs.Trigger
				class="shrink-0 grow basis-20"
				value={i.toString()}
				disabled={splitDay.isRestDay}
			>
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
				{#each selectedSplitDay.exercises as exercise, idx}
					<ExerciseTemplateCard
						{idx}
						{...emptyFunctions}
						readOnly
						dragDisabled
						exerciseTemplate={exercise}
					/>
				{/each}
			</div>
		</Card.Root>
	{/if}
</Tabs.Root>
