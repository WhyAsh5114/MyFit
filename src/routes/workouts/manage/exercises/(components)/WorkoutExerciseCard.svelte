<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import type { WorkoutExerciseInProgress } from '$lib/workoutFunctions';
	import { dragHandle } from 'svelte-dnd-action';
	import GripVertical from 'virtual:icons/lucide/grip-vertical';
	import MenuIcon from 'virtual:icons/lucide/menu';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import SkipIcon from 'virtual:icons/lucide/skip-forward';
	import DeleteIcon from 'virtual:icons/lucide/trash';
	import HistoryIcon from 'virtual:icons/lucide/history';
	import { workoutRunes } from '../../workoutRunes.svelte';
	import CompareComponent from './CompareComponent.svelte';
	import SetsComponent from './SetsComponent.svelte';

	type PropsType = {
		readOnly?: boolean;
		idx: number;
		reordering?: boolean;
		comparing?: boolean;
		exercise: WorkoutExerciseInProgress;
	};

	let { readOnly, idx, reordering = false, comparing = false, exercise = $bindable() }: PropsType = $props();

	let isContextMenuOpen = $state(false);

	function skipSetsLeft() {
		exercise.sets.forEach((set) => {
			if (set.completed) return;
			set.skipped = true;
			set.miniSets.forEach((miniSet) => (miniSet.completed = false));
		});
		workoutRunes.workoutExercises = workoutRunes.workoutExercises;
	}
</script>

<div class="flex flex-col gap-0.5 rounded-md border bg-card/50 p-2 backdrop-blur-sm">
	<div class="flex items-center gap-0.5">
		<span class="mr-auto truncate">{exercise.name}</span>
		{#if !readOnly}
			{#if reordering}
				<div role="button" tabindex="0" use:dragHandle>
					<GripVertical />
				</div>
			{:else}
				<DropdownMenu.Root onOpenChange={(v) => (isContextMenuOpen = v)} open={isContextMenuOpen}>
					<DropdownMenu.Trigger asChild let:builder>
						<button use:builder.action {...builder} class="px-0.5 py-0">
							<MenuIcon class="h-4 w-4" />
						</button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Group>
							<DropdownMenu.Item class="gap-2" onclick={() => workoutRunes.setEditingExercise(exercise)}>
								<EditIcon /> Edit
							</DropdownMenu.Item>
							<DropdownMenu.Item class="gap-2" onclick={skipSetsLeft}>
								<SkipIcon /> Skip sets left
							</DropdownMenu.Item>
							<DropdownMenu.Item class="gap-2" onclick={() => workoutRunes.openExerciseHistorySheet(exercise.name)}>
								<HistoryIcon /> History
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="gap-2 text-red-500"
								onclick={() => {
									workoutRunes.deleteExercise(idx);
									isContextMenuOpen = false;
								}}
							>
								<DeleteIcon /> Delete
							</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		{/if}
	</div>
	<div class="flex items-center gap-0.5">
		<span class="mr-auto text-sm lowercase text-muted-foreground">
			{exercise.sets.length}
			{convertCamelCaseToNormal(exercise.setType)} sets of
			{exercise.repRangeStart} to {exercise.repRangeEnd} reps
		</span>
		{#if exercise.bodyweightFraction !== null}
			<Badge variant="outline">BW</Badge>
		{/if}
		<Badge class="whitespace-nowrap" variant="secondary">
			{exercise.targetMuscleGroup === 'Custom'
				? exercise.customMuscleGroup
				: convertCamelCaseToNormal(exercise.targetMuscleGroup)}
		</Badge>
	</div>
	{#if exercise.note}
		<div class="mt-1 flex items-center bg-secondary px-1 py-0.5 text-sm">
			{exercise.note}
		</div>
	{/if}
	{#if exercise.sets.length > 0 && !reordering}
		<Separator class="my-1" />
		{#if comparing}
			<CompareComponent {exercise} />
		{:else}
			<SetsComponent bind:exercise />
		{/if}
	{/if}
</div>
