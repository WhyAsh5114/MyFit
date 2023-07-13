<script lang="ts">
	import { invalidate, invalidateAll } from '$app/navigation';
	import MyModal from '$lib/components/MyModal.svelte';

	export let data;

	let selectedMesocycle: undefined | number;

	let anotherMesoActiveModal: HTMLDialogElement;
	let successModal: HTMLDialogElement;
	let errorModal: HTMLDialogElement;
	let callingEndpoint = false;
	let errorMsg = '';
	async function startMesocycle(endActiveMeso = false) {
		if (selectedMesocycle === undefined) {
			return;
		}
		if (data.activeMesocycle && !endActiveMeso) {
			anotherMesoActiveModal.show();
			return;
		}
		const reqJSON: APIActiveMesocycleCreate = {
			activeMesocycle: {
				mesoID: selectedMesocycle,
				startDate: +new Date(),
				workouts: []
			}
		};
		callingEndpoint = true;
		const response = await fetch('/api/activeMesocycle/create', {
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
			errorModal.show();
		}
	}
</script>

<MyModal
	title="Another mesocycle is already active"
	titleColor="text-warning"
	bind:dialogElement={anotherMesoActiveModal}
>
	{#if data.mesocycles && data.activeMesocycle}
		<p>
			Would you like to end
			<span class="italic font-semibold">
				{data.mesocycles[data.activeMesocycle.mesoID]?.name}
			</span>
			?
		</p>
		<div class="join w-full mt-4">
			<button class="btn join-item w-1/2">No</button>
			<button
				class="btn btn-warning join-item w-1/2"
				on:click={() => {
					startMesocycle(true);
				}}>Yes</button
			>
		</div>
	{/if}
</MyModal>
<MyModal title="Success" titleColor="text-success" bind:dialogElement={successModal} onClose={() => {invalidateAll(); console.log("invalidated")}}>
	{#if data.mesocycles && selectedMesocycle !== undefined}
		<p>
			Mesocycle <span class="italic font-semibold">{data.mesocycles[selectedMesocycle]?.name}</span>
			has been activated
		</p>
	{/if}
</MyModal>
<MyModal title="Error" titleColor="text-error" bind:dialogElement={errorModal}>
	<p></p>
</MyModal>
<div class="flex flex-col bg-primary p-5 rounded-lg w-full">
	<h3 class="card-title">Current Mesocycle</h3>
	<div class="h-0.5 bg-black mt-1 mb-4" />
	<div class="flex gap-2">
		<select class="select select-sm select-bordered grow" bind:value={selectedMesocycle}>
			{#if data.mesocycles === null || data.mesocycles.length === 0}
				<option value={undefined}>No mesocycle created</option>
			{:else}
				{#if !data.activeMesocycle}
					<option selected disabled value={undefined}>No active mesocycle</option>
				{/if}
				{#each data.mesocycles as meso, i}
					{#if meso}
						{#if data.activeMesocycle?.mesoID === i}
							<option selected value={i}>{meso.name}</option>
						{:else}
							<option value={i}>{meso.name}</option>
						{/if}
					{/if}
				{/each}
			{/if}
		</select>
		{#if selectedMesocycle !== undefined && selectedMesocycle !== data.activeMesocycle?.mesoID}
			<button
				class="btn btn-sm btn-accent"
				on:click={() => {
					startMesocycle();
				}}
			>
				{#if callingEndpoint}
					<span class="loading loading-spinner" />
				{/if}
				Start
			</button>
		{/if}
	</div>
</div>
