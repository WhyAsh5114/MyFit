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
	import { mesocycleExerciseSplitRunes } from '../mesocycleExerciseSplitRunes.svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import DndComponent from '$lib/components/mesocycleAndExerciseSplit/DndComponent.svelte';
	import SwapExercisesDialog from '$lib/components/mesocycleAndExerciseSplit/SwapExercisesDialog.svelte';
	import AddEditExerciseDrawer from '$lib/components/mesocycleAndExerciseSplit/AddEditExerciseDrawer.svelte';
	import type { Mesocycle } from '@prisma/client';
	import type { MesocycleExerciseTemplateWithoutIdsOrIndex } from '$lib/components/mesocycleAndExerciseSplit/commonTypes';

	let swapDialogOpen = $state(false);
	let reordering = $state(false);
	let splitDayName = $derived(
		mesocycleExerciseSplitRunes.splitDays[mesocycleExerciseSplitRunes.selectedSplitDayIndex].name
	);
	let selectedSplitDayExercises = $derived(
		mesocycleExerciseSplitRunes.splitExercises[mesocycleExerciseSplitRunes.selectedSplitDayIndex]
	);

	function submitExercises() {
		const noExerciseAddedDays = mesocycleExerciseSplitRunes.splitDays.filter((splitDay, idx) => {
			return !splitDay.isRestDay && mesocycleExerciseSplitRunes.splitExercises[idx].length === 0;
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
		mesocycleExerciseSplitRunes.selectedSplitDayIndex = mesocycleExerciseSplitRunes.splitDays.findIndex(
			(splitDay) => splitDay.name === v
		);
	}}
	value={splitDayName}
>
	<Tabs.List class="flex justify-start overflow-x-auto">
		{#each mesocycleExerciseSplitRunes.splitExercises as _, idx}
			{@const { name, isRestDay } = mesocycleExerciseSplitRunes.splitDays[idx]}
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
						Day {mesocycleExerciseSplitRunes.selectedSplitDayIndex + 1}
					</span>
				</div>
				<AddEditExerciseDrawer
					addExercise={mesocycleExerciseSplitRunes.addExercise}
					context="mesocycle"
					editExercise={mesocycleExerciseSplitRunes.editExercise}
					editingExercise={mesocycleExerciseSplitRunes.editingExercise}
					mesocycle={mesocycleExerciseSplitRunes.mesocycle as Mesocycle}
					setEditingExercise={mesocycleExerciseSplitRunes.setEditingExercise}
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
						<Button aria-label="exercise-split-functions" builders={[builder]} size="icon" variant="outline">
							<MenuIcon />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							<DropdownMenu.Item
								class="gap-2"
								disabled={selectedSplitDayExercises.length === 0}
								onclick={mesocycleExerciseSplitRunes.cutExercises}
							>
								<CutIcon /> Cut
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="gap-2"
								disabled={selectedSplitDayExercises.length === 0}
								onclick={mesocycleExerciseSplitRunes.copyExercises}
							>
								<CopyIcon /> Copy
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="gap-2"
								disabled={mesocycleExerciseSplitRunes.copiedExercises === undefined}
								onclick={mesocycleExerciseSplitRunes.pasteExercises}
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
					context="mesocycle"
					deleteExercise={mesocycleExerciseSplitRunes.deleteExercise}
					{reordering}
					setEditingExercise={mesocycleExerciseSplitRunes.setEditingExercise}
					bind:itemList={
						mesocycleExerciseSplitRunes.splitExercises[
							mesocycleExerciseSplitRunes.selectedSplitDayIndex
						] as MesocycleExerciseTemplateWithoutIdsOrIndex[]
					}
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
	selectedSplitDayIndex={mesocycleExerciseSplitRunes.selectedSplitDayIndex}
	splitDays={mesocycleExerciseSplitRunes.splitDays}
	swapExercises={mesocycleExerciseSplitRunes.swapExercises}
	bind:open={swapDialogOpen}
/>
