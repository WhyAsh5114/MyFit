<script lang="ts">
	import AddSplitExerciseModal from "./AddSplitExerciseModal.svelte";
	export let exercises: SplitExercise[];

	let addSplitExerciseModal: HTMLDialogElement;
</script>

<AddSplitExerciseModal bind:dialogElement={addSplitExerciseModal} bind:exercises />
<div class="flex h-px grow">
	{#each exercises as exercise}
		<p>{exercise.name}</p>
	{/each}
</div>
<div class="join mb-3 w-full grid grid-cols-2">
	<button class="btn btn-primary join-item">Functions</button>
	<button class="btn btn-primary join-item" on:click={() => addSplitExerciseModal.show()}>
		Add exercise
	</button>
</div>
