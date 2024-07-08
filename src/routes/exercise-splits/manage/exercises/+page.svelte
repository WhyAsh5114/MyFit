<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import CopyIcon from 'virtual:icons/lucide/copy';
	import PasteIcon from 'virtual:icons/lucide/clipboard-paste';
	import CutIcon from 'virtual:icons/lucide/scissors';
	import MenuIcon from 'virtual:icons/lucide/menu';
	import SwapIcon from 'virtual:icons/ph/swap';
	import ReorderIcon from 'virtual:icons/lucide/git-compare-arrows';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import { exerciseSplitRunes } from '../exerciseSplitRunes.svelte';
	import AddEditExerciseDrawer from '$lib/components/mesocycleAndExerciseSplit/AddEditExerciseDrawer.svelte';
	import DndComponent from '$lib/components/mesocycleAndExerciseSplit/DndComponent.svelte';
	import SwapExercisesDialog from '$lib/components/mesocycleAndExerciseSplit/SwapExercisesDialog.svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let swapDialogOpen = $state(false);
	let reordering = $state(false);
	let splitDayName = $derived(
		exerciseSplitRunes.splitDays[exerciseSplitRunes.selectedSplitDayIndex].name
	);
	let selectedSplitDayExercises = $derived(
		exerciseSplitRunes.splitExercises[exerciseSplitRunes.selectedSplitDayIndex]
	);

	function submitExercises() {
		const noExerciseAddedDays = exerciseSplitRunes.splitDays.filter((splitDay, idx) => {
			return !splitDay.isRestDay && exerciseSplitRunes.splitExercises[idx].length === 0;
		});
		if (noExerciseAddedDays.length > 0) {
			toast.error(`Add at least one exercise to each workout`, {
				description: `Missing in: ${noExerciseAddedDays.map((splitDay) => splitDay.name).join(', ')}`
			});
			return;
		}
		goto('./overview');
	}
</script>

<H3>Exercises</H3>
<Tabs.Root
	class="flex w-full grow flex-col"
	onValueChange={(v) => {
		exerciseSplitRunes.selectedSplitDayIndex = exerciseSplitRunes.splitDays.findIndex(
			(splitDay) => splitDay.name === v
		);
	}}
	value={splitDayName}
>
	<Tabs.List class="flex justify-start overflow-x-auto">
		{#each exerciseSplitRunes.splitExercises as _, idx}
			{@const { name, isRestDay } = exerciseSplitRunes.splitDays[idx]}
			<Tabs.Trigger class="px-4" disabled={isRestDay} value={name}>
				{name !== '' ? name : 'Rest'}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	<Tabs.Content class="grow" value={splitDayName}>
		<div class="flex h-full flex-col gap-2">
			<div class="flex items-center gap-2">
				<div class="mr-auto flex flex-col">
					<span class="text-xl font-semibold">{splitDayName}</span>
					<span class="font-medium text-muted-foreground">
						Day {exerciseSplitRunes.selectedSplitDayIndex + 1}
					</span>
				</div>
				<AddEditExerciseDrawer
					addExercise={exerciseSplitRunes.addExercise}
					context="exerciseSplit"
					editExercise={exerciseSplitRunes.editExercise}
					editingExercise={exerciseSplitRunes.editingExercise}
					setEditingExercise={exerciseSplitRunes.setEditingExercise}
				/>
				<Button onclick={() => (reordering = !reordering)} size="icon" variant="outline">
					{#if !reordering}
						<ReorderIcon />
					{:else}
						<EditIcon />
					{/if}
				</Button>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button
							aria-label="exercise-split-functions"
							builders={[builder]}
							size="icon"
							variant="outline"
						>
							<MenuIcon />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							<DropdownMenu.Item
								class="gap-2"
								disabled={selectedSplitDayExercises.length === 0}
								onclick={exerciseSplitRunes.cutExercises}
							>
								<CutIcon /> Cut
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="gap-2"
								disabled={selectedSplitDayExercises.length === 0}
								onclick={exerciseSplitRunes.copyExercises}
							>
								<CopyIcon /> Copy
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="gap-2"
								disabled={exerciseSplitRunes.copiedExercises === undefined}
								onclick={exerciseSplitRunes.pasteExercises}
							>
								<PasteIcon /> Paste
							</DropdownMenu.Item>
							<DropdownMenu.Item class="gap-2" onclick={() => (swapDialogOpen = true)}>
								<SwapIcon /> Swap
							</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
			<div class="flex h-px grow flex-col overflow-y-auto">
				<DndComponent
					context="exerciseSplit"
					deleteExercise={exerciseSplitRunes.deleteExercise}
					{reordering}
					setEditingExercise={exerciseSplitRunes.setEditingExercise}
					bind:itemList={exerciseSplitRunes.splitExercises[
						exerciseSplitRunes.selectedSplitDayIndex
					]}
				/>
			</div>
		</div>
	</Tabs.Content>
</Tabs.Root>

<div class="mt-2 grid grid-cols-2 gap-1">
	<Button href="./structure" variant="secondary">Previous</Button>
	<Button onclick={submitExercises}>Next</Button>
</div>

<SwapExercisesDialog
	selectedSplitDayIndex={exerciseSplitRunes.selectedSplitDayIndex}
	splitDays={exerciseSplitRunes.splitDays}
	swapExercises={exerciseSplitRunes.swapExercises}
	bind:open={swapDialogOpen}
/>
