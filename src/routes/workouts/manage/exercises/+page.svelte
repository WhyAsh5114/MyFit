<script lang="ts">
	import { goto } from '$app/navigation';
	import InfoPopover from '$lib/components/InfoPopover.svelte';
	import AddEditExerciseDrawer from '$lib/components/mesocycleAndExerciseSplit/AddEditExerciseDrawer.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { arraySum } from '$lib/utils.js';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import ReorderIcon from 'virtual:icons/lucide/git-compare-arrows';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import CompareIcon from 'virtual:icons/lucide/scale';
	import { workoutRunes } from '../workoutRunes.svelte.js';
	import DndComponent from './(components)/DndComponent.svelte';

	let { data } = $props();
	let reordering = $state(false);
	let comparing = $state(false);

	let workoutData = $derived(workoutRunes.workoutData);
	let workoutExercises = $derived(workoutRunes.workoutExercises);

	let totalSets = $derived(
		workoutExercises
			? arraySum(
					workoutExercises.map((e) =>
						arraySum(e.sets.filter((s) => !s.skipped).map((s) => s.miniSets.length + 1))
					)
				)
			: null
	);
	let completedSets = $derived(
		workoutExercises
			? arraySum(
					workoutExercises.map((e) =>
						arraySum(
							e.sets
								.filter((s) => !s.skipped)
								.map((s) => s.miniSets.filter((ms) => ms.completed).length + (s.completed ? 1 : 0))
						)
					)
				)
			: null
	);

	onMount(async () => {
		if (workoutRunes.workoutData === null) goto('./start');
		const serverData = await data.serverData;
		if (workoutRunes.workoutExercises === null) {
			workoutRunes.workoutExercises = serverData?.todaysWorkoutExercises ?? [];
		}
		if (workoutRunes.previousWorkoutData === null) {
			workoutRunes.previousWorkoutData = serverData?.previousWorkoutData ?? null;
		}
	});

	function getFormattedDate(date: string | Date) {
		if (typeof date === 'string') date = new Date(date);
		return date.toLocaleString(undefined, {
			month: 'long',
			day: 'numeric'
		});
	}

	function submitWorkoutExercises() {
		if (totalSets === null || completedSets === null) return;
		if (workoutExercises === null) return;
		if (workoutExercises.length === 0) {
			toast.error('Add at least one exercise');
			return;
		}
		if (completedSets < totalSets) {
			toast.error('Complete all sets to proceed');
			return;
		}
		goto('./overview');
	}
</script>

<H3>Exercises</H3>

{#if workoutData !== null}
	<div class="flex items-end">
		<div class="mr-auto flex flex-col">
			{#if workoutData.workoutOfMesocycle !== undefined}
				<span class="text-lg font-semibold">
					{workoutData.workoutOfMesocycle.splitDayName}
				</span>
				<span class="flex items-center gap-2 text-sm text-muted-foreground">
					Day {workoutData.workoutOfMesocycle?.splitDayIndex + 1}, Cycle {workoutData
						.workoutOfMesocycle?.cycleNumber}
					<InfoPopover align="center" ariaLabel="mesocycle-info">
						<span class="text-sm text-foreground">
							{workoutData.workoutOfMesocycle.mesocycle.name}:
							{getFormattedDate(workoutData.startedAt)}
						</span>
					</InfoPopover>
				</span>
			{:else}
				<span class="text-lg font-semibold">
					{getFormattedDate(workoutData.startedAt)}
				</span>
				<p class="text-sm text-muted-foreground">
					{workoutRunes.editingWorkoutId === null ? 'Without mesocycle' : 'Edit mode'}
				</p>
			{/if}
		</div>
		<div class="grid grid-cols-3 gap-x-2 gap-y-1">
			<Button
				aria-label="reorder-toggle"
				disabled={comparing}
				onclick={() => (reordering = !reordering)}
				size="icon"
				variant="outline"
			>
				{#if !reordering}
					<ReorderIcon />
				{:else}
					<EditIcon />
				{/if}
			</Button>
			<Button
				aria-label="compare-exercises"
				disabled={reordering || workoutRunes.editingWorkoutId !== null}
				onclick={() => (comparing = !comparing)}
				size="icon"
				variant="outline"
			>
				{#if !comparing}
					<CompareIcon />
				{:else}
					<EditIcon />
				{/if}
			</Button>
			<AddEditExerciseDrawer
				addExercise={workoutRunes.addExercise}
				context="workout"
				editExercise={workoutRunes.editExercise}
				editingExercise={workoutRunes.editingExercise}
				mesocycle={workoutData.workoutOfMesocycle?.mesocycle}
				setEditingExercise={workoutRunes.setEditingExercise}
			/>
			{#if totalSets !== null && completedSets !== null}
				<Progress class="col-span-3 h-1.5" max={totalSets} value={completedSets} />
			{:else}
				<Skeleton class="col-span-3 h-1.5 w-full" />
			{/if}
		</div>
	</div>
{/if}

{#if workoutRunes.workoutExercises === null}
	<div class="flex h-full w-full items-center justify-center text-muted-foreground">
		Fetching exercises
		<LoaderCircle class="ml-2 animate-spin" />
	</div>
{:else}
	<div class="mt-2 flex h-px grow flex-col overflow-y-auto">
		<DndComponent {comparing} {reordering} bind:itemList={workoutRunes.workoutExercises} />
	</div>
{/if}

<div class="mt-2 grid grid-cols-2 gap-1">
	<Button href="./start" variant="secondary">Previous</Button>
	<Button onclick={submitWorkoutExercises}>Next</Button>
</div>
