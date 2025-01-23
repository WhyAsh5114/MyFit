<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import { dragHandle } from 'svelte-dnd-action';
	import GripVertical from 'virtual:icons/lucide/grip-vertical';
	import MenuIcon from 'virtual:icons/lucide/menu';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import DeleteIcon from 'virtual:icons/lucide/trash';
	import type {
		MesocycleExerciseTemplateWithoutIdsOrIndex,
		SplitExerciseTemplateWithoutIdsOrIndex
	} from './commonTypes';

	type ExerciseTemplateCardProps = ReadOnlyProps | EditableProps;

	type ReadOnlyProps = { readOnly: true } & ContextProps;
	type EditableProps = ContextProps &
		EditableContextProps & {
			readOnly: false;
			idx: number;
			reordering: boolean;
			deleteExercise: (idx: number) => void;
		};

	type ContextProps =
		| { context: 'exerciseSplit'; exerciseTemplate: SplitExerciseTemplateWithoutIdsOrIndex }
		| { context: 'mesocycle'; exerciseTemplate: MesocycleExerciseTemplateWithoutIdsOrIndex };

	type EditableContextProps =
		| {
				context: 'exerciseSplit';
				setEditingExercise: (exercise: SplitExerciseTemplateWithoutIdsOrIndex) => void;
		  }
		| {
				context: 'mesocycle';
				setEditingExercise: (exercise: MesocycleExerciseTemplateWithoutIdsOrIndex) => void;
		  };

	let { ...props }: ExerciseTemplateCardProps = $props();
	let isContextMenuOpen = $state(false);
</script>

<div class="flex flex-col gap-0.5 rounded-md border bg-card/50 p-2 backdrop-blur-sm">
	<div class="flex items-center gap-0.5">
		<span class="mr-auto truncate">{props.exerciseTemplate.name}</span>
		{#if !props.readOnly}
			{#if props.reordering}
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
							<DropdownMenu.Item
								class="gap-2"
								onclick={() => {
									if (props.context === 'exerciseSplit') props.setEditingExercise(props.exerciseTemplate);
									else props.setEditingExercise(props.exerciseTemplate);
								}}
							>
								<EditIcon /> Edit
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="gap-2 text-red-500"
								onclick={() => {
									props.deleteExercise(props.idx);
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
		<span class="mr-auto text-sm text-muted-foreground" class:lowercase={props.context === 'mesocycle'}>
			{#if props.context === 'mesocycle'}
				{props.exerciseTemplate.sets}
			{/if}
			{convertCamelCaseToNormal(props.exerciseTemplate.setType)} sets of
			{props.exerciseTemplate.repRangeStart} to {props.exerciseTemplate.repRangeEnd} reps
		</span>
		{#if props.exerciseTemplate.bodyweightFraction}
			<Badge variant="outline">BW</Badge>
		{/if}
		<Badge class="whitespace-nowrap" variant="secondary">
			{props.exerciseTemplate.targetMuscleGroup === 'Custom'
				? props.exerciseTemplate.customMuscleGroup
				: convertCamelCaseToNormal(props.exerciseTemplate.targetMuscleGroup)}
		</Badge>
	</div>
	{#if props.exerciseTemplate.note}
		<div class="mt-1 flex items-center bg-secondary px-1 py-0.5 text-sm">
			{props.exerciseTemplate.note}
		</div>
	{/if}
</div>
