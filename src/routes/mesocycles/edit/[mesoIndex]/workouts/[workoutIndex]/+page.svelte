<script lang="ts">
	import SplitExercisesTable from '$lib/components/mesocycle/SplitExercisesTable.svelte';
	import { days } from '$lib/commonDB.js';
	import { navigating } from '$app/stores';
	import MyModal from '$lib/components/MyModal.svelte';
	import { goto } from '$app/navigation';

	export let data;

	let errorMsg = '';
	let callingEndpoint = false;
	async function saveWorkout() {
		if (data.splitExercises.length == 0) {
			errorMsg = 'Add at least one exercise to the workout';
			errorModal.show();
			return false;
		}
		callingEndpoint = true;
		const reqJSON: APIMesocyclesUpdateWorkout = {
			mesoIndex: data.mesoIndex,
			workoutIndex: data.workoutIndex,
			splitExercises: data.splitExercises
		};
		const response = await fetch('/api/mesocycles/updateWorkout', {
			method: 'POST',
			body: JSON.stringify(reqJSON),
			headers: {
				'content-type': 'application/json'
			}
		});
		callingEndpoint = false;
		if (response.ok) {
			successModal.show();
		} else {
			errorMsg = await response.text();
		}
	}

	let successModal: HTMLDialogElement;
	let errorModal: HTMLDialogElement;
</script>

<MyModal
	title="Success"
	titleColor="text-success"
	bind:dialogElement={successModal}
	onClose={() => {
		goto(`/mesocycles/edit/${data.mesoIndex}`);
	}}
>
	<p>
		Workout <span class="font-semibold italic">{data.splitSchedule[data.workoutIndex]}</span> has been
		updated successfully
	</p>
</MyModal>

<MyModal title="Error" titleColor="text-error" bind:dialogElement={errorModal}>
	<p>{errorMsg}</p>
</MyModal>

<SplitExercisesTable
	bind:currentDay={days[data.workoutIndex]}
	bind:workoutName={data.splitSchedule[data.workoutIndex]}
	bind:splitExercises={data.splitExercises}
/>

<div class="join w-full grid grid-cols-2 mt-2">
	<a class="join-item btn btn-primary" href="/mesocycles/edit/{data.mesoIndex}">
		{#if $navigating?.to?.url.pathname === `/mesocycles/edit/${data.mesoIndex}`}
			<span class="loading loading-spinner" />
		{/if}
		Cancel
	</a>
	<button class="join-item btn btn-accent" on:click={saveWorkout}>
		{#if callingEndpoint}
			<span class="loading loading-spinner loading-sm" />
			Saving
		{:else}
			Save Workout
		{/if}
	</button>
</div>
