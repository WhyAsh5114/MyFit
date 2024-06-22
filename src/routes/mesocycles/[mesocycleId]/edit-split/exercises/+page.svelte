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
	import ExerciseSplitDrawer from './(components)/ExerciseSplitDrawer.svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import DndComponent from '$lib/components/mesocycleAndExerciseSplit/DndComponent.svelte';
	import SwapExercisesDialog from '$lib/components/mesocycleAndExerciseSplit/SwapExercisesDialog.svelte';

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
	value={splitDayName}
	onValueChange={(v) => {
		mesocycleExerciseSplitRunes.selectedSplitDayIndex =
			mesocycleExerciseSplitRunes.splitDays.findIndex((splitDay) => splitDay.name === v);
	}}
>
	<Tabs.List class="flex justify-start overflow-x-auto">
		{#each mesocycleExerciseSplitRunes.splitExercises as _, idx}
			{@const { name, isRestDay } = mesocycleExerciseSplitRunes.splitDays[idx]}
			<Tabs.Trigger value={name} disabled={isRestDay} class="px-4">
				{name !== '' ? name : 'Rest'}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	<Tabs.Content value={splitDayName} class="grow">
		<div class="flex h-full flex-col gap-2">
			<div class="flex items-center gap-2">
				<div class="mr-auto flex flex-col">
					<span class="text-xl font-semibold">{splitDayName}</span>
					<span class="font-medium text-muted-foreground">
						Day {mesocycleExerciseSplitRunes.selectedSplitDayIndex + 1}
					</span>
				</div>
				<ExerciseSplitDrawer />
				<Button size="icon" variant="outline" onclick={() => (reordering = !reordering)}>
					{#if !reordering}
						<ReorderIcon />
					{:else}
						<EditIcon />
					{/if}
				</Button>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button
							builders={[builder]}
							size="icon"
							variant="outline"
							aria-label="exercise-split-functions"
						>
							<MenuIcon />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							<DropdownMenu.Item
								class="gap-2"
								onclick={mesocycleExerciseSplitRunes.cutExercises}
								disabled={selectedSplitDayExercises.length === 0}
							>
								<CutIcon /> Cut
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="gap-2"
								onclick={mesocycleExerciseSplitRunes.copyExercises}
								disabled={selectedSplitDayExercises.length === 0}
							>
								<CopyIcon /> Copy
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="gap-2"
								onclick={mesocycleExerciseSplitRunes.pasteExercises}
								disabled={mesocycleExerciseSplitRunes.copiedExercises === undefined}
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
					setEditingExercise={mesocycleExerciseSplitRunes.setEditingExercise}
					bind:itemList={mesocycleExerciseSplitRunes.splitExercises[
						mesocycleExerciseSplitRunes.selectedSplitDayIndex
					]}
					{reordering}
				/>
			</div>
		</div>
	</Tabs.Content>
</Tabs.Root>

<div class="mt-2 grid grid-cols-2 gap-1">
	<Button variant="secondary" href="./structure">Previous</Button>
	<Button onclick={submitExercises}>Next</Button>
</div>

<SwapExercisesDialog
	splitDays={mesocycleExerciseSplitRunes.splitDays}
	selectedSplitDayIndex={mesocycleExerciseSplitRunes.selectedSplitDayIndex}
	swapExercises={mesocycleExerciseSplitRunes.swapExercises}
	bind:open={swapDialogOpen}
/>
