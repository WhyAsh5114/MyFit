<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import MenuIcon from 'virtual:icons/lucide/menu';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import DeleteIcon from 'virtual:icons/lucide/trash';
	import GripVertical from 'virtual:icons/lucide/grip-vertical';
	import { exerciseSplitRunes } from '../manage/exerciseSplitRunes.svelte';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import { dragHandle } from 'svelte-dnd-action';
	import type { ExerciseTemplateWithoutIDs } from '$lib/types';

	type ExerciseTemplateCardProps = {
		readOnly?: boolean;
		idx: number;
		exerciseTemplate: ExerciseTemplateWithoutIDs;
		reordering?: boolean;
	};

	let { readOnly = false, idx, exerciseTemplate, reordering }: ExerciseTemplateCardProps = $props();
	let isContextMenuOpen = $state(false);
</script>

<div class="flex flex-col gap-0.5 rounded-md border bg-card/50 p-2 backdrop-blur-sm">
	<div class="flex items-center gap-0.5">
		<span class="mr-auto truncate">{exerciseTemplate.name}</span>
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
								on:click={() => (exerciseSplitRunes.editingExercise = exerciseTemplate)}
								class="gap-2"
							>
								<EditIcon /> Edit
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="gap-2 text-red-500"
								on:click={() => {
									exerciseSplitRunes.deleteExercise(idx);
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
		<span class="mr-auto text-sm text-muted-foreground">
			{exerciseTemplate.setType} sets of
			{exerciseTemplate.repRangeStart} to {exerciseTemplate.repRangeEnd} reps
		</span>
		{#if exerciseTemplate.involvesBodyweight}
			<Badge variant="outline">BW</Badge>
		{/if}
		<Badge class="whitespace-nowrap" variant="secondary">
			{exerciseTemplate.targetMuscleGroup === 'Custom'
				? exerciseTemplate.customMuscleGroup
				: convertCamelCaseToNormal(exerciseTemplate.targetMuscleGroup)}
		</Badge>
	</div>
	{#if exerciseTemplate.note}
		<div class="mt-1 flex items-center bg-secondary px-1 py-0.5 text-sm">
			{exerciseTemplate.note}
		</div>
	{/if}
</div>
