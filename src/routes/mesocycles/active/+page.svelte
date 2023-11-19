<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import MyModal from "$lib/components/MyModal.svelte";
	export let data;

	let modal: HTMLDialogElement;
	let modalTitle = "";
	let modalText = "";

	let stopConfirmationModal: HTMLDialogElement;
	let callingEndpoint = false;
	async function stopMesocycle() {
		const requestBody: APIMesocyclesStopMesocycle = {
			activeMesocycleId: data.activeMesocycle.id
		};
		callingEndpoint = true;
		const response = await fetch("/api/mesocycles/stopMesocycle", {
			method: "POST",
			body: JSON.stringify(requestBody),
			headers: {
				"content-type": "application/json"
			}
		});
		callingEndpoint = false;
		stopConfirmationModal.close();
		modalText = await response.text();
		if (response.ok) {
			modalTitle = "Success";
		} else {
			modalTitle = "Error";
		}
		modal.show();
	}

	let redirecting = false;
	async function closeModal() {
		redirecting = true;
		await invalidateAll();
		await goto("/mesocycles");
		redirecting = false;
	}
</script>

<MyModal bind:dialogElement={modal} bind:title={modalTitle} onClose={closeModal}>
	{modalText}
</MyModal>

<MyModal
	bind:dialogElement={stopConfirmationModal}
	title="Stop mesocycle"
	titleColor="text-warning"
>
	Are you sure you want to stop this mesocycle?
	<div class="join grid grid-cols-2 mt-5">
		<button class="join-item btn">Cancel</button>
		<button
			class="join-item btn btn-warning"
			type="button"
			disabled={callingEndpoint}
			on:click={stopMesocycle}
		>
			{#if callingEndpoint}
				<span class="loading loading-bars"></span>
			{:else}
				Yes, stop
			{/if}
		</button>
	</div>
</MyModal>

<button
	class="btn btn-block btn-warning mt-auto"
	on:click={() => stopConfirmationModal.show()}
	disabled={redirecting}
>
	{#if redirecting}
		<span class="loading loading-bars"></span>
	{:else}
		Stop mesocycle
	{/if}
</button>
