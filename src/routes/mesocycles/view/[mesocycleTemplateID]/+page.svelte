<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { calculateTotalDuration } from "$lib/commonDB.js";
	import MyModal from "$lib/components/MyModal.svelte";
	import { caloricStates } from "$lib/types/arrays.js";
	export let data;

	let caloricState = caloricStates.find(
		(state) => state.value === data.mesocycleTemplate.caloricBalance
	);

	let deleteModal: HTMLDialogElement;
	let deletionSuccessfulModal: HTMLDialogElement;
	let errorModal: HTMLDialogElement;
	let errorMsg = "";
	let callingEndpoint = false;

	async function deleteMesocycle() {
		const requestBody: APIMesocyclesDeleteTemplate = {
			mesocycleTemplateId: $page.params.mesocycleTemplateId
		};
		callingEndpoint = true;
		const response = await fetch("/api/mesocycles/deleteTemplate", {
			method: "POST",
			body: JSON.stringify(requestBody),
			headers: {
				"content-type": "application/json"
			}
		});
		callingEndpoint = false;
		deleteModal.close();
		if (response.ok) {
			deletionSuccessfulModal.show();
			return;
		}
		errorMsg = await response.text();
		errorModal.show();
	}

    let startSuccessfulModal: HTMLDialogElement;
	async function startMesocycle() {
		const requestBody: APIMesocyclesStartMesocycle = {
			mesocycleTemplateId: $page.params.mesocycleTemplateId
		};
		callingEndpoint = true;
		const response = await fetch("/api/mesocycles/startMesocycle", {
			method: "POST",
			body: JSON.stringify(requestBody),
			headers: {
				"content-type": "application/json"
			}
		});
		callingEndpoint = false;
        if (response.ok) {
            startSuccessfulModal.show();
            return;
        }
        errorMsg = await response.text();
        errorModal.show();
	}
</script>

<MyModal bind:dialogElement={errorModal} title="Error" titleColor="text-error">
	{errorMsg}
</MyModal>

<MyModal bind:dialogElement={deleteModal} title="Delete mesocycle" titleColor="text-error">
	Are you sure you want to delete this mesocycle? <b>({data.mesocycleTemplate.name})</b>
	<div class="join grid grid-cols-2 mt-4">
		<button class="join-item btn uppercase"> Cancel </button>
		<button
			class="join-item btn btn-error uppercase"
			disabled={callingEndpoint}
			type="button"
			on:click={deleteMesocycle}
		>
			Yes, delete
		</button>
	</div>
</MyModal>
<MyModal
	title="Deleted successfully"
	titleColor="text-accent"
	bind:dialogElement={deletionSuccessfulModal}
	onClose={() => {
		goto("/mesocycles");
	}}
>
	Mesocycle <span class="font-semibold">{data.mesocycleTemplate.name}</span> deleted successfully
</MyModal>

<MyModal bind:dialogElement={startSuccessfulModal} title="Started successfully" titleColor="text-accent">
    Mesocycle started successfully
</MyModal>

<div class="stats stats-vertical grid-cols-2 overflow-y-auto">
	<div class="stat col-span-2">
		<div class="stat-title">Mesocycle name</div>
		<div class="stat-value">{data.mesocycleTemplate.name}</div>
	</div>

	<div class="stat">
		<div class="stat-title">Start RIR</div>
		<div class="stat-value">{data.mesocycleTemplate.startRIR} RIR</div>
	</div>
	<div class="stat">
		<div class="stat-title">Total duration</div>
		<div class="stat-value">
			{calculateTotalDuration(data.mesocycleTemplate.RIRProgression)} cycles
		</div>
	</div>

	<div class="stat col-span-2">
		<div class="stat-title">Caloric state</div>
		<div class="stat-value">{caloricState?.name} ({caloricState?.commonTerm})</div>
	</div>

	<div class="stat col-span-2">
		<div class="stat-title">Exercise split</div>
		<div class="flex flex-wrap gap-2 mt-1.5">
			{#each data.mesocycleTemplate.exerciseSplit as split, i}
				<div class="join font-semibold text-sm">
					<span class="join-item bg-base-200 px-2">D{i + 1}</span>
					{#if split}
						<span class="join-item bg-secondary text-black px-2">{split.name}</span>
					{:else}
						<span class="join-item bg-base-200 px-2">Rest</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	{#if data.mesocycleTemplate.specialization}
		<div class="stat col-span-2">
			<div class="stat-title">Specialization</div>
			<div class="flex flex-wrap gap-1 mt-1.5">
				{#each data.mesocycleTemplate.specialization as muscleGroup}
					<span class="badge badge-accent font-semibold">{muscleGroup}</span>
				{/each}
			</div>
		</div>
	{/if}
</div>
<div class="join grid grid-cols-3 mt-auto">
	<button class="join-item btn btn-error" on:click={() => deleteModal.show()}>Delete</button>
	<button class="join-item btn btn-primary">Edit</button>
	<button class="join-item btn btn-accent" on:click={startMesocycle}>Start</button>
</div>
