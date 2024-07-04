<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { onMount } from 'svelte';
	import { workoutRunes } from '../workoutRunes.svelte.js';
	import { goto } from '$app/navigation';
	import DndComponent from './(components)/DndComponent.svelte';
	import InfoPopover from '$lib/components/InfoPopover.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import CompareIcon from 'virtual:icons/lucide/scale';
	import ReorderIcon from 'virtual:icons/lucide/git-compare-arrows';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import { arraySum } from '$lib/utils.js';
	import AddEditExerciseDrawer from '$lib/components/mesocycleAndExerciseSplit/AddEditExerciseDrawer.svelte';

	let { data } = $props();
	let reordering = $state(false);

	let workoutData = $derived(workoutRunes.workoutData);
	let workoutExercises = $derived(workoutRunes.workoutExercises);

	onMount(async () => {
		if (workoutRunes.workoutData === null) goto('./start');
		if (workoutRunes.workoutExercises === null)
			workoutRunes.workoutExercises = await data.workoutExercises;
	});

	function getFormattedDate(date: string | Date) {
		if (typeof date === 'string') date = new Date(date);
		return date.toLocaleString(undefined, {
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<H3>Exercises</H3>

{#if workoutData !== null && workoutExercises !== null}
	<div class="flex items-end">
		<div class="mr-auto flex flex-col">
			{#if workoutData.workoutOfMesocycle !== undefined}
				<span class="text-lg font-semibold">
					{workoutData.workoutOfMesocycle.splitDayName}
				</span>
				<span class="flex items-center gap-2 text-sm text-muted-foreground">
					Day {workoutData.workoutOfMesocycle?.dayNumber}, Cycle {workoutData.workoutOfMesocycle
						?.cycleNumber}
					<InfoPopover ariaLabel="mesocycle-info" align="center">
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
				<p class="text-sm text-muted-foreground">Without mesocycle</p>
			{/if}
		</div>
		<div class="grid grid-cols-3 gap-x-2 gap-y-1">
			<Button size="icon" variant="outline" onclick={() => (reordering = !reordering)}>
				{#if !reordering}
					<ReorderIcon />
				{:else}
					<EditIcon />
				{/if}
			</Button>
			<Button size="icon" variant="outline" aria-label="compare-exercises">
				<CompareIcon />
				<!-- TODO: comparison stuff -->
			</Button>
			<AddEditExerciseDrawer
				context="workout"
				mesocycle={workoutData.workoutOfMesocycle?.mesocycle}
				addExercise={workoutRunes.addExercise}
				editExercise={workoutRunes.editExercise}
				setEditingExercise={workoutRunes.setEditingExercise}
				editingExercise={workoutRunes.editingExercise}
			/>
			<Progress
				class="col-span-3 h-1.5"
				value={arraySum(workoutExercises.map((e) => e.sets.filter((set) => set.completed).length))}
				max={arraySum(workoutExercises.map((e) => e.sets.length))}
			/>
		</div>
	</div>
{/if}

{#if workoutRunes.workoutExercises === null}
	TODO: skeletons
{:else}
	<div class="mt-2 flex h-px grow flex-col overflow-y-auto">
		<DndComponent bind:itemList={workoutRunes.workoutExercises} {reordering} />
	</div>
{/if}
