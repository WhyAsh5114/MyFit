<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import {
		dndzone,
		type DndEvent,
		SOURCES,
		SHADOW_ITEM_MARKER_PROPERTY_NAME,
		TRIGGERS,
		overrideItemIdKeyNameBeforeInitialisingDndZones
	} from 'svelte-dnd-action';
	overrideItemIdKeyNameBeforeInitialisingDndZones('name');
	import ExerciseTemplateCard from '../../../ExerciseTemplateCard.svelte';

	export let itemList: (ExerciseTemplate & { isDndShadowItem?: boolean })[];
	export let openEditExercise: (idx: number) => void;
	export let deleteExercise: (idx: number) => void;

	let dragDisabled = true;

	function handleConsider(e: CustomEvent<DndEvent<ExerciseTemplate>>) {
		const {
			items: newItems,
			info: { source, trigger }
		} = e.detail;
		itemList = newItems;
		if (source === SOURCES.KEYBOARD && trigger === TRIGGERS.DRAG_STOPPED) dragDisabled = true;
	}

	function handleFinalize(e: CustomEvent<DndEvent<ExerciseTemplate>>) {
		const {
			items: newItems,
			info: { source }
		} = e.detail;
		itemList = newItems;
		if (source === SOURCES.POINTER) dragDisabled = true;
	}

	function startDrag(e: DragEvent) {
		dragDisabled = false;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if ((e.key === 'Enter' || e.key === ' ') && dragDisabled) dragDisabled = false;
	}
</script>

<div
	use:dndzone={{
		items: itemList,
		flipDurationMs: 200,
		dropTargetClasses: ['border-none'],
		dropTargetStyle: {},
		dragDisabled
	}}
	on:consider={handleConsider}
	on:finalize={handleFinalize}
	class="flex h-px grow flex-col gap-1 overflow-y-auto mt-2"
>
	{#each itemList as exerciseTemplate, idx (exerciseTemplate.name)}
		<div class="relative" animate:flip={{ duration: 200 }}>
			<ExerciseTemplateCard
				{idx}
				{exerciseTemplate}
				{startDrag}
				{handleKeyDown}
				{openEditExercise}
				{deleteExercise}
			/>
			{#if exerciseTemplate[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
				<div in:fade={{ duration: 200 }} class="custom-shadow-item" />
			{/if}
		</div>
	{:else}
		<div class="flex flex-col p-2 border rounded-md text-sm text-muted-foreground">
			No exercises added
		</div>
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
