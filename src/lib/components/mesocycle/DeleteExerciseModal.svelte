<script lang="ts">
	import MyModal from '$lib/components/MyModal.svelte';

	export let deleteExerciseModal: HTMLDialogElement;
	export let exerciseName: string;
	export let indexOfExerciseToDelete: number;
	export let splitExercises: SplitExercise[];

	function deleteExercise() {
		splitExercises.splice(indexOfExerciseToDelete, 1);
		splitExercises = splitExercises;
	}
</script>

<MyModal title="Delete exercise" titleColor="text-error" bind:dialogElement={deleteExerciseModal}>
	<p>Are you sure you want to delete <span class="font-semibold">{exerciseName}</span>?</p>
	<div class="join mt-4 w-full grid grid-cols-2">
		<button class="join-item btn"> No </button>
		<button class="join-item btn btn-error text-black" on:click={deleteExercise}>Yes</button>
	</div>
</MyModal>
