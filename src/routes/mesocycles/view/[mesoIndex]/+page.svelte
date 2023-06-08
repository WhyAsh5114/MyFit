<script lang="ts">
	import { goto } from '$app/navigation';
	import MyModal from '$lib/MyModal.svelte';

	export let data;

	let confirmDeleteModal: HTMLDialogElement;
	let callingEndpoint = false;
	let errorMsg = '';
	async function deleteMesocycle() {
		callingEndpoint = true;
		errorMsg = '';
		const response = await fetch('/api/mesocycles/delete', {
			method: 'POST',
			body: JSON.stringify({
				ind: data.ind
			}),
			headers: {
				'content-type': 'application/json'
			}
		});
		confirmDeleteModal.close();
		callingEndpoint = false;
		if (response.ok) {
			deletionSuccessfulModal.show();
		} else {
			errorMsg = await response.text();
			deletionErrorModal.show();
		}
	}

	let deletionSuccessfulModal: HTMLDialogElement;
	let deletionErrorModal: HTMLDialogElement;
</script>

<MyModal title="Delete Mesocycle" titleColor="text-error" bind:dialogElement={confirmDeleteModal}>
	<p>
		Are you sure you want to delete mesocycle
		<span class="font-semibold italic">{data.meso?.name}</span>?
	</p>
	<div class="join grid grid-cols-2 w-full mt-4">
		<form on:submit|preventDefault class="join-item">
			<button class="btn btn-error text-black w-full" on:click={deleteMesocycle}>
				{#if callingEndpoint}
					<span class="loading loading-spinner" />
				{/if}
				Yes
			</button>
		</form>
		<button class="join-item btn btn-secondary"> No </button>
	</div>
</MyModal>
<MyModal
	title="Success"
	titleColor="text-success"
	bind:dialogElement={deletionSuccessfulModal}
	onClose={async () => {
		await goto('/mesocycles');
	}}
>
	<p>Mesocycle <span class="font-semibold italic">{data.meso?.name}</span> deleted successfully</p>
</MyModal>
<MyModal title="Error" titleColor="text-error" bind:dialogElement={deletionErrorModal}>
	<p>{errorMsg}</p>
</MyModal>
<div class="flex flex-col w-full gap-2">
	<div class="stats bg-primary">
		<div class="stat">
			<div class="opacity-75">Name</div>
			<div class="text-2xl font-bold text-white">{data.meso?.name}</div>
		</div>
	</div>
	<div class="stats bg-primary">
		<div class="stat">
			<div class="opacity-75">Duration</div>
			<div class="text-2xl font-bold text-white">
				{#if data.meso?.duration && data.meso?.duration >= 4 && data.meso?.duration <= 16}
					{data.meso?.duration} weeks
				{:else}
					<span class="text-warning">{data.meso?.duration} weeks</span>
				{/if}
			</div>
		</div>
		<div class="stat">
			<div class="opacity-75">Start RIR</div>
			<div class="text-2xl font-bold text-white">{data.meso?.startRIR} RIR</div>
		</div>
	</div>
</div>

<div class="join grid grid-cols-2 w-full mt-auto">
	<button
		class="join-item btn btn-error text-black"
		on:click={() => {
			confirmDeleteModal.show();
		}}
	>
		Delete
	</button>
	<button class="join-item btn btn-primary"> Edit </button>
</div>
