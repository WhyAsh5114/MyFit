<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import MenuIcon from 'virtual:icons/lucide/menu';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import DeleteIcon from 'virtual:icons/lucide/trash';
	import { exerciseSplitRunes, type ExerciseTemplate } from '../[mode]/exerciseSplitRunes.svelte';

	type ExerciseTemplateCardProps = {
		readOnly?: boolean;
		idx: number;
		exerciseTemplate: ExerciseTemplate;
		dragDisabled: boolean;
	};

	let {
		readOnly = false,
		idx,
		exerciseTemplate,
		dragDisabled
	}: ExerciseTemplateCardProps = $props();

	let isContextMenuOpen = $state(false);
</script>

<div class="flex flex-col gap-0.5 rounded-md border bg-card/50 p-2 backdrop-blur-sm">
	<div class="flex items-center gap-0.5">
		<span class="mr-auto truncate text-sm">{exerciseTemplate.name}</span>
		{#if !readOnly}
			<DropdownMenu.Root open={isContextMenuOpen} onOpenChange={(v) => (isContextMenuOpen = v)}>
				<DropdownMenu.Trigger asChild let:builder>
					<button
						use:builder.action
						{...builder}
						class="px-0.5 py-0"
						onmousedown={() => (dragDisabled = false)}
						ontouchstart={() => (dragDisabled = false)}
						onmouseup={() => (dragDisabled = true)}
						ontouchend={() => (dragDisabled = true)}
					>
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
	</div>
	<div class="flex items-center gap-0.5">
		<span class="mr-auto text-[13px] lowercase text-muted-foreground">
			{exerciseTemplate.sets}
			{exerciseTemplate.setType} sets of
			{exerciseTemplate.repRangeStart} to {exerciseTemplate.repRangeEnd} reps
		</span>
		{#if exerciseTemplate.involvesBodyweight}
			<Badge variant="outline">BW</Badge>
		{/if}
		<Badge class="whitespace-nowrap" variant="secondary">
			{exerciseTemplate.targetMuscleGroup}
		</Badge>
	</div>
	{#if exerciseTemplate.note}
		<div class="mt-1 flex items-center bg-secondary px-1 py-0.5 text-xs">
			{exerciseTemplate.note}
		</div>
	{/if}
</div>
