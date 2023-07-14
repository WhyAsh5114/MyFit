<script lang="ts">
	import MyModal from '$lib/components/MyModal.svelte';

	export let deleteExerciseModal: HTMLDialogElement;
	export let exerciseName: string;
	export let indexOfExerciseToDelete: number;
	export let exercises: any[];

	function deleteExercise() {
		exercises.splice(indexOfExerciseToDelete, 1);
		exercises = exercises;
	}
</script>

<MyModal title="Delete exercise" titleColor="text-error" bind:dialogElement={deleteExerciseModal}>
	<p>Are you sure you want to delete <span class="font-semibold">{exerciseName}</span>?</p>
	<div class="join mt-4 w-full grid grid-cols-2">
		<button class="join-item btn"> No </button>
		<button class="join-item btn btn-error text-white" on:click={deleteExercise}>Yes</button>
	</div>
</MyModal>
