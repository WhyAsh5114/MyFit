<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import {
		dragHandleZone,
		type DndEvent,
		SHADOW_ITEM_MARKER_PROPERTY_NAME
	} from 'svelte-dnd-action';
	import { type Prisma } from '@prisma/client';
	import ExerciseTemplateCard from './ExerciseTemplateCard.svelte';

	type NormalExerciseTemplate = Prisma.ExerciseTemplateCreateWithoutExerciseSplitDayInput;
	type MesocycleExerciseTemplate =
		Prisma.MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInput;
	type ExerciseTemplate = NormalExerciseTemplate | MesocycleExerciseTemplate;

	type PropsType = {
		readOnly?: boolean;
		reordering: boolean;
		deleteExercise: (idx: number) => void;
	} & (
		| {
				context: 'exerciseSplit';
				itemList: (NormalExerciseTemplate & { isDndShadowItem?: boolean })[];
				setEditingExercise: (exercise: NormalExerciseTemplate) => void;
		  }
		| {
				context: 'mesocycle';
				itemList: (MesocycleExerciseTemplate & { isDndShadowItem?: boolean })[];
				setEditingExercise: (exercise: MesocycleExerciseTemplate) => void;
		  }
	);

	let { itemList = $bindable(), reordering, ...contextProps }: PropsType = $props();

	function handleSort(e: CustomEvent<DndEvent<ExerciseTemplate>>) {
		itemList = e.detail.items;
	}
</script>

<div
	use:dragHandleZone={{
		items: itemList,
		flipDurationMs: 200,
		dropTargetClasses: ['border-none'],
		dropTargetStyle: {}
	}}
	onconsider={handleSort}
	onfinalize={handleSort}
	class="flex h-px grow flex-col gap-1 overflow-y-auto"
>
	{#each itemList as exerciseTemplate, idx (exerciseTemplate.name)}
		<div class="relative" animate:flip={{ duration: 200 }}>
			{#if 'sets' in exerciseTemplate && contextProps.context === 'mesocycle'}
				<ExerciseTemplateCard
					context="mesocycle"
					{idx}
					{reordering}
					{exerciseTemplate}
					deleteExercise={contextProps.deleteExercise}
					setEditingExercise={contextProps.setEditingExercise}
				/>
			{:else if contextProps.context === 'exerciseSplit'}
				<ExerciseTemplateCard
					context="exerciseSplit"
					{idx}
					{exerciseTemplate}
					{reordering}
					deleteExercise={contextProps.deleteExercise}
					setEditingExercise={contextProps.setEditingExercise}
				/>
			{/if}
			{#if exerciseTemplate[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
				<div in:fade={{ duration: 200 }} class="custom-shadow-item"></div>
			{/if}
		</div>
	{:else}
		<div class="flex flex-col p-2 border rounded-md text-muted-foreground">No exercises added</div>
	{/each}
</div>

<style lang="postcss">
	.custom-shadow-item {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		visibility: visible;
		opacity: 0.5;
		margin: 0;
		box-sizing: border-box;
		@apply rounded-md bg-secondary;
	}
</style>
