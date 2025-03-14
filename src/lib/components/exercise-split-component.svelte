<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Scrollbar } from '$lib/components/ui/scroll-area';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import type { ExerciseSplitTemplate } from '$lib/constants';
	import { GitCompareArrowsIcon, MenuIcon, WrenchIcon } from 'lucide-svelte';
	import AddExerciseSheet from './add-exercise-sheet.svelte';

	type PropsType = { currentSplit: ExerciseSplitTemplate };

	let { currentSplit }: PropsType = $props();
	let selectedDayIndex = $state<string>(
		currentSplit.splitDays.findIndex((splitDay) => splitDay.splitDaySessions.length).toString()
	);
	let selectedSessionIndex = $state<string>('0');

	let selectedDay = $derived(
		Number(selectedDayIndex) >= 0 ? currentSplit?.splitDays[Number(selectedDayIndex)] : undefined
	);
	let selectedSession = $derived(
		Number(selectedSessionIndex) >= 0 && selectedDay
			? selectedDay.splitDaySessions[Number(selectedSessionIndex)]
			: undefined
	);

	$effect(() => {
		if (selectedDayIndex !== undefined) selectedSessionIndex = '0';
	});
</script>

<div class="flex grow flex-col gap-2">
	<Tabs.Root
		value={`${selectedDayIndex}>${selectedSessionIndex}`}
		class="w-full"
		onValueChange={(v) => {
			const [dayIndex, sessionIndex] = v.split('>').map(Number);
			selectedDayIndex = dayIndex.toString();
			selectedSessionIndex = sessionIndex.toString();
		}}
	>
		<ScrollArea>
			<Tabs.List>
				{#each currentSplit.splitDays as splitDay (splitDay.dayIndex)}
					<Tabs.Trigger value="" disabled>
						<span class="w-4">D{splitDay.dayIndex + 1}</span>
						{#if splitDay.splitDaySessions.length === 0}
							<span>&nbsp;(Rest day)</span>
						{/if}
					</Tabs.Trigger>
					{#each splitDay.splitDaySessions as splitDaySession (splitDaySession.sessionIndex)}
						<Tabs.Trigger value={`${splitDay.dayIndex}>${splitDaySession.sessionIndex}`}>
							{splitDaySession.name}
						</Tabs.Trigger>
					{/each}
				{/each}
				<Scrollbar orientation="horizontal" />
			</Tabs.List>
		</ScrollArea>
	</Tabs.Root>
	<div class="bg-card flex gap-2 rounded-md border p-2">
		<div class="flex grow flex-col">
			<span class="font-semibold">{currentSplit.name}</span>
			<span class="text-muted-foreground text-sm">
				Day {Number(selectedDayIndex) + 1}, Session {Number(selectedSessionIndex) + 1}
			</span>
		</div>
		<AddExerciseSheet />
		<Button variant="outline" size="icon"><GitCompareArrowsIcon /></Button>
		<Button variant="outline" size="icon"><WrenchIcon /></Button>
	</div>
	<ScrollArea class="h-px grow">
		{#each selectedSession!.exercises as exercise (exercise.exerciseIndex)}
			<div class="bg-card flex flex-col rounded-md border p-2">
				<div class="flex items-center justify-between">
					<span class="font-medium">{exercise.name}</span>
					<Button class="h-4 w-4 p-0" variant="ghost"><MenuIcon /></Button>
				</div>
				<span class="text-muted-foreground text-sm">
					{exercise.setType} sets of {exercise.repRangeStart} to {exercise.repRangeEnd} reps
				</span>
			</div>
		{/each}
	</ScrollArea>
</div>
