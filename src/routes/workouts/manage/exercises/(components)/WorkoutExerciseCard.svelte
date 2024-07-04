<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { WorkoutExerciseInProgress } from '$lib/mesoToWorkouts';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import { dragHandle } from 'svelte-dnd-action';
	import GripVertical from 'virtual:icons/lucide/grip-vertical';
	import MenuIcon from 'virtual:icons/lucide/menu';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import DeleteIcon from 'virtual:icons/lucide/trash';
	import { workoutRunes } from '../../workoutRunes.svelte';
	import SetsComponent from './SetsComponent.svelte';

	type PropsType = {
		readOnly?: boolean;
		idx: number;
		reordering?: boolean;
		exercise: WorkoutExerciseInProgress;
	};

	let { readOnly, idx, reordering = false, exercise = $bindable() }: PropsType = $props();
	let isContextMenuOpen = $state(false);
</script>

<div class="flex flex-col gap-0.5 rounded-md border bg-card/50 p-2 backdrop-blur-sm">
	<div class="flex items-center gap-0.5">
		<span class="mr-auto truncate">{exercise.name}</span>
		{#if !readOnly}
			{#if reordering}
				<div use:dragHandle role="button" tabindex="0">
					<GripVertical />
				</div>
			{:else}
				<DropdownMenu.Root open={isContextMenuOpen} onOpenChange={(v) => (isContextMenuOpen = v)}>
					<DropdownMenu.Trigger asChild let:builder>
						<button use:builder.action {...builder} class="px-0.5 py-0">
							<MenuIcon class="h-4 w-4" />
						</button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Group>
							<DropdownMenu.Item
								onclick={() => workoutRunes.setEditingExercise(exercise)}
								class="gap-2"
							>
								<EditIcon /> Edit
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
			{exercise.setType} sets of
			{exercise.repRangeStart} to {exercise.repRangeEnd} reps
		</span>
		{#if exercise.involvesBodyweight}
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
	<SetsComponent bind:exercise {reordering} />
</div>
