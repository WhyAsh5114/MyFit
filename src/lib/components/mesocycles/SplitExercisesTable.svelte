<script lang="ts">
	import { flip } from "svelte/animate";
	import AddSplitExerciseModal from "./AddSplitExerciseModal.svelte";
	import EditSplitExerciseModal from "./EditSplitExerciseModal.svelte";
	import SplitExerciseCard from "./SplitExerciseCard.svelte";
	import { slide } from "svelte/transition";
	export let exercises: SplitExercise[];

	let addSplitExerciseModal: HTMLDialogElement;

	let editSplitExerciseModal: HTMLDialogElement;
	let editingExerciseNumber = -1;

	function deleteExercise(idx: number) {
		exercises.splice(idx, 1);
		exercises = exercises;
	}

	function editExercise(idx: number) {
		editingExerciseNumber = idx;
		editSplitExerciseModal.show();
	}
</script>

<AddSplitExerciseModal bind:dialogElement={addSplitExerciseModal} bind:exercises />
<EditSplitExerciseModal
	bind:dialogElement={editSplitExerciseModal}
	bind:exercises
	bind:idx={editingExerciseNumber}
/>

<ul class="flex flex-col gap-1 h-px grow overflow-y-auto">
	{#each exercises as exercise, idx (exercise.name)}
		<div transition:slide|local={{ duration: 200 }} animate:flip={{ duration: 200 }}>
			<SplitExerciseCard bind:exercise {idx} {deleteExercise} {editExercise} />
		</div>
	{/each}
</ul>
<div class="join my-2 w-full grid grid-cols-2">
	<button class="btn btn-primary join-item">Functions</button>
	<button class="btn btn-primary join-item" on:click={() => addSplitExerciseModal.show()}>
		Add exercise
	</button>
</div>
