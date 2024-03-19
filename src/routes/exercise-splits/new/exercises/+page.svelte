<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { exerciseSplitStore } from '../exerciseSplitStore';

	import CopyIcon from 'virtual:icons/carbon/copy';
	import PasteIcon from 'virtual:icons/carbon/paste';
	import CutIcon from 'virtual:icons/material-symbols/cut';
	import MenuIcon from 'virtual:icons/material-symbols/menu';
	import DndComponent from './DndComponent.svelte';
	import ExerciseDrawer from './ExerciseDrawer.svelte';

	type CustomExerciseSplitDay = {
		name: string;
		exerciseTemplates: (ExerciseTemplate & { isDndShadowItem?: boolean })[];
	};

	let splitDays = $exerciseSplitStore.splitDays;
	let selectedDayIndex = splitDays.findIndex((splitDay) => splitDay !== null).toString();
	let selectedSplitDay: CustomExerciseSplitDay | null;
	$: selectedSplitDay = splitDays[parseInt(selectedDayIndex)];

	let editingExercise: (ExerciseTemplate & { idx: number }) | null = null;
	let copiedExercises: ExerciseTemplate[] = [];

	function addExercise(exerciseTemplate: ExerciseTemplate) {
		if (!selectedSplitDay) return false;
		const duplicate = selectedSplitDay.exerciseTemplates.find((exercise) => {
			return exercise.name === exerciseTemplate.name;
		});
		if (duplicate) return false;
		selectedSplitDay.exerciseTemplates = [...selectedSplitDay.exerciseTemplates, exerciseTemplate];
		return true;
	}

	function openEditExercise(idx: number) {
		if (!selectedSplitDay) return;
		editingExercise = { ...selectedSplitDay.exerciseTemplates[idx], idx };
	}

	function deleteExercise(idx: number) {
		if (!selectedSplitDay) return;
		selectedSplitDay.exerciseTemplates = selectedSplitDay.exerciseTemplates.filter(
			(_, _idx) => _idx !== idx
		);
	}

	function copyExercises() {
		if (!selectedSplitDay) return;
		copiedExercises = JSON.parse(JSON.stringify(selectedSplitDay.exerciseTemplates));
	}

	function pasteExercises() {
		if (!selectedSplitDay) return;
		selectedSplitDay.exerciseTemplates = JSON.parse(JSON.stringify(copiedExercises));
	}

	function cutExercises() {
		if (!selectedSplitDay) return;
		copyExercises();
		selectedSplitDay.exerciseTemplates = [];
	}
</script>

<H2>New exercise split</H2>
<H3>Exercises</H3>

<Tabs.Root bind:value={selectedDayIndex}>
	<Tabs.List class="w-full justify-start overflow-x-auto">
		{#each splitDays as splitDay, i}
			<Tabs.Trigger
				class="shrink-0 grow basis-20"
				value={i.toString()}
				disabled={splitDay === null}
			>
				{splitDay ? splitDay.name : 'Rest'}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	{#if selectedSplitDay}
		<div class="flex flex-col p-2">
			<div class="flex items-center gap-3">
				<div class="mr-auto flex flex-col">
					<span class="truncate text-lg font-semibold">{selectedSplitDay.name}</span>
					<span class="font-sembold text-sm text-muted-foreground">
						Day {parseInt(selectedDayIndex) + 1}
					</span>
				</div>
				<ExerciseDrawer />
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button
							size="icon"
							variant="outline"
							aria-label="workout day actions"
							builders={[builder]}
						>
							<MenuIcon />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Item class="gap-2">
							<CopyIcon /> Copy
						</DropdownMenu.Item>
						<DropdownMenu.Item class="gap-2">
							<PasteIcon /> Paste
						</DropdownMenu.Item>
						<DropdownMenu.Item class="gap-2">
							<CutIcon /> Cut
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>
	{/if}
</Tabs.Root>
{#if selectedSplitDay}
	<DndComponent
		{openEditExercise}
		{deleteExercise}
		bind:itemList={selectedSplitDay.exerciseTemplates}
	/>
{/if}

<div class="mt-auto grid grid-cols-2 gap-1">
	<Button variant="secondary">
		<a href="/exercise-splits/new/structure" class="w-full">Back</a>
	</Button>
	<Button>Next</Button>
</div>
