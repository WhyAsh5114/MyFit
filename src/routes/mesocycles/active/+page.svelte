<script lang="ts">
	import { goto, invalidate } from "$app/navigation";
	import MyModal from "$lib/components/MyModal.svelte";
	import { dateFormatter } from "$lib/util/CommonFunctions.js";
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
	async function closeMesocycleStoppedModal() {
		redirecting = true;
		await invalidate("mesocycle:active");
		await goto("/mesocycles");
		redirecting = false;
	}
</script>

<MyModal bind:dialogElement={modal} bind:title={modalTitle} onClose={closeMesocycleStoppedModal}>
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

<div class="stats stats-vertical">
	<div class="stat">
		<div class="stat-title">Mesocycle template</div>
		<a class="stat-value link truncate" href="/mesocycles/viewTemplate/{data.activeMesocycleTemplate.id}">
			{data.activeMesocycleTemplate.name}
		</a>
	</div>
	<div class="stat">
		<div class="stat-title">Started at</div>
		<div class="stat-value">{dateFormatter(data.activeMesocycle.startTimestamp)}</div>
	</div>
	<div class="stat">
		<div class="stat-title">Workouts</div>
		<div class="flex flex-col max-h-32 overflow-y-auto mt-2 gap-1">
			{#each data.streamed.workoutsStreamArray as workoutPromise}
				{#await workoutPromise}
					<div class="skeleton h-8 w-full bg-primary brightness-50 rounded-md"></div>
				{:then workout}
					{#if workout}
						<a class="btn h-8 btn-sm" href="/workouts/viewTemplate/{workout.id}">
							<div class="flex w-full justify-between items-center">
								<span>{dateFormatter(workout.startTimestamp)}</span>
								<span class="font-normal text-sm">
									{data.activeMesocycleTemplate.exerciseSplit[workout.dayNumber]?.name},
									Cycle {workout.cycleNumber}
								</span>
							</div>
						</a>
					{/if}
				{/await}
			{/each}
		</div>
	</div>
</div>

<button
	class="btn btn-block btn-warning mt-auto"
	on:click={() => stopConfirmationModal.show()}
	disabled={redirecting}
>
	{#if redirecting}
		Redirecting
		<span class="loading loading-bars"></span>
	{:else}
		Stop mesocycle
	{/if}
</button>
