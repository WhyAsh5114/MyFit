<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { dragHandleZone, type DndEvent, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import WorkoutExerciseCard from './WorkoutExerciseCard.svelte';
	import type { WorkoutExerciseInProgress } from '$lib/workoutFunctions';

	type PropsType = {
		readOnly?: boolean;
		reordering: boolean;
		comparing: boolean;
		itemList: (WorkoutExerciseInProgress & { isDndShadowItem?: boolean })[];
	};

	let { itemList = $bindable(), reordering, comparing, readOnly }: PropsType = $props();

	function handleSort(e: CustomEvent<DndEvent<WorkoutExerciseInProgress>>) {
		itemList = e.detail.items;
	}
</script>

<div
	class="flex h-px grow flex-col gap-1 overflow-y-auto"
	onconsider={handleSort}
	onfinalize={handleSort}
	use:dragHandleZone={{
		items: itemList,
		flipDurationMs: 200,
		dropTargetClasses: ['border-none'],
		dropTargetStyle: {}
	}}
>
	{#each itemList as exercise, idx (exercise.name)}
		<div class="relative" animate:flip={{ duration: 200 }}>
			<WorkoutExerciseCard {comparing} {idx} {readOnly} {reordering} bind:exercise={itemList[idx]} />
			{#if exercise[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
				<div class="custom-shadow-item" in:fade={{ duration: 200 }}></div>
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
