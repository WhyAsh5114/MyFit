<script lang="ts">
	import { flip } from "svelte/animate";
	import AddSplitExerciseModal from "./AddSplitExerciseModal.svelte";
	import EditSplitExerciseModal from "./EditSplitExerciseModal.svelte";
	import SplitExerciseCard from "./SplitExerciseCard.svelte";
	import { slide } from "svelte/transition";
	export let exercises: SplitExercise[];

	let addSplitExerciseModal: HTMLDialogElement;

	let editSplitExerciseModal: HTMLDialogElement;
	let editingExerciseName: undefined | string = undefined;

	function deleteExercise(name: string) {
		exercises = exercises.filter((exercise) => exercise.name !== name);
	}
</script>

<AddSplitExerciseModal bind:dialogElement={addSplitExerciseModal} bind:exercises />
<EditSplitExerciseModal
	bind:dialogElement={editSplitExerciseModal}
	bind:exercises
	bind:exerciseOriginalName={editingExerciseName}
/>

<ul class="flex flex-col gap-1 h-px grow overflow-y-auto">
	{#each exercises as exercise (exercise.name)}
		<div transition:slide|local={{ duration: 200 }} animate:flip={{ duration: 200 }}>
			<SplitExerciseCard
				bind:exercise
				bind:editingExerciseName
				bind:editSplitExerciseModal
				{deleteExercise}
			/>
		</div>
	{/each}
</ul>
<div class="join my-2 w-full grid grid-cols-2">
	<button class="btn btn-primary join-item">Functions</button>
	<button class="btn btn-primary join-item" on:click={() => addSplitExerciseModal.show()}>
		Add exercise
	</button>
</div>
