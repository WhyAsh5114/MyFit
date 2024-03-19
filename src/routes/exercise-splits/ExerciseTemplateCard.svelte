<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import MenuIcon from 'virtual:icons/material-symbols/menu';
	import EditIcon from 'virtual:icons/material-symbols/edit';
	import DeleteIcon from 'virtual:icons/material-symbols/delete';

	export let idx: number;
	export let exerciseTemplate: ExerciseTemplate;
	export let openEditExercise: (idx: number) => void;
	export let deleteExercise: (idx: number) => void;

	export let startDrag: (e: any) => void;
	export let handleKeyDown: (e: any) => void;

	let isContextMenuOpen = false;
</script>

<div class="flex flex-col gap-0.5 rounded-md border bg-background/50 p-2 backdrop-blur-sm">
	<div class="flex items-center gap-0.5">
		<span class="mr-auto truncate text-sm">{exerciseTemplate.name}</span>
		<DropdownMenu.Root open={isContextMenuOpen} onOpenChange={(v) => (isContextMenuOpen = v)}>
			<DropdownMenu.Trigger asChild let:builder>
				<button
					use:builder.action
					{...builder}
					class="px-0.5 py-0"
					on:mousedown={startDrag}
					on:touchstart={startDrag}
					on:keydown={handleKeyDown}
				>
					<MenuIcon class="h-4 w-4" />
				</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Group>
					<DropdownMenu.Item on:click={() => openEditExercise(idx)} class="gap-2">
						<EditIcon /> Edit
					</DropdownMenu.Item>
					<DropdownMenu.Item
						class="text-red-500 gap-2"
						on:click={() => {
							deleteExercise(idx);
							isContextMenuOpen = false;
						}}
					>
						<DeleteIcon /> Delete
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="flex items-center gap-0.5">
		<span class="mr-auto text-xs text-muted-foreground">
			{exerciseTemplate.sets}
			{exerciseTemplate.setType} sets of {exerciseTemplate.repRangeStart} to {exerciseTemplate.repRangeEnd}
			reps
		</span>
		{#if exerciseTemplate.involvesBodyweight}
			<Badge variant="outline">BW</Badge>
		{/if}
		<Badge class="whitespace-nowrap" variant="secondary">
			{exerciseTemplate.targetMuscleGroup}
		</Badge>
	</div>
</div>
