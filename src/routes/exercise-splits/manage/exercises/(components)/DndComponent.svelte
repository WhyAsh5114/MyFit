<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import {
		dragHandleZone,
		type DndEvent,
		SHADOW_ITEM_MARKER_PROPERTY_NAME
	} from 'svelte-dnd-action';
	import ExerciseTemplateCard from '../../../(components)/ExerciseTemplateCard.svelte';
	import { type Prisma } from '@prisma/client';

	type ExerciseTemplateWithoutIds = Prisma.ExerciseTemplateCreateWithoutExerciseSplitDayInput;
	type PropsType = {
		itemList: (ExerciseTemplateWithoutIds & { isDndShadowItem?: boolean })[];
		reordering: boolean;
	};

	let { itemList = $bindable(), reordering }: PropsType = $props();
	function handleSort(e: CustomEvent<DndEvent<ExerciseTemplateWithoutIds>>) {
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
			<ExerciseTemplateCard {idx} {exerciseTemplate} {reordering} />
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
