<script lang="ts">
	import MyModal from '$lib/MyModal.svelte';
	import { splitExercises } from '../newMesoStore';

	export let deleteExerciseModal: HTMLDialogElement;
	export let exerciseName: string;
	export let currentDay: string;
	export let indexOfExerciseToDelete: number;
	const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	function deleteExercise() {
		$splitExercises[days.indexOf(currentDay)].splice(indexOfExerciseToDelete, 1);
        $splitExercises[days.indexOf(currentDay)] = $splitExercises[days.indexOf(currentDay)];
	}
</script>

<MyModal title="Delete exercise" titleColor="text-error" bind:dialogElement={deleteExerciseModal}>
	<p>Are you sure you want to delete <span class="font-semibold">{exerciseName}</span>?</p>
	<div class="join mt-4 w-full">
		<button class="join-item btn w-1/2"> No </button>
		<button class="join-item btn btn-error text-white w-1/2" on:click={deleteExercise}>Yes</button>
	</div>
</MyModal>
