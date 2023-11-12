<script lang="ts">
	import AddSplitExerciseModal from "./AddSplitExerciseModal.svelte";
	import EditSplitExerciseModal from "./EditSplitExerciseModal.svelte";
	import SplitExerciseCard from "./SplitExerciseCard.svelte";
	export let exercises: SplitExercise[];

	let addSplitExerciseModal: HTMLDialogElement;
	let editSplitExerciseModal: HTMLDialogElement;

	let editingExerciseName: undefined | string = undefined;
</script>

<AddSplitExerciseModal bind:dialogElement={addSplitExerciseModal} bind:exercises />
<EditSplitExerciseModal
	bind:dialogElement={editSplitExerciseModal}
	bind:exercises
	bind:exerciseOriginalName={editingExerciseName}
/>

<div class="flex flex-col gap-1 h-px grow overflow-y-auto">
	{#each exercises as exercise}
		<SplitExerciseCard bind:exercise bind:editingExerciseName bind:editSplitExerciseModal />
	{/each}
</div>
<div class="join my-2 w-full grid grid-cols-2">
	<button class="btn btn-primary join-item">Functions</button>
	<button class="btn btn-primary join-item" on:click={() => addSplitExerciseModal.show()}>
		Add exercise
	</button>
</div>
