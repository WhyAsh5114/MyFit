<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { navigating } from '$app/stores';
	import MuscleGroupComponent from '$lib/components/mesocycle/MuscleGroupComponent.svelte';
	import MyModal from '$lib/components/MyModal.svelte';
	import { commonMuscleGroups, dateFormatter, days } from '$lib/commonDB';

	export let data;

	let confirmDeleteModal: HTMLDialogElement;
	let callingEndpoint = false;
	let errorMsg = '';
	async function deleteMesocycle() {
		callingEndpoint = true;
		errorMsg = '';
		const reqJSON: APIMesocyclesDelete = { mesoIndex: parseInt(data.mesoIndex) };
		const response = await fetch('/api/mesocycles/delete', {
			method: 'POST',
			body: JSON.stringify(reqJSON),
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

	let muscleFrequency = Object.fromEntries(commonMuscleGroups.map((muscleGroup) => [muscleGroup, 0]));
	let muscleVolume = Object.fromEntries(commonMuscleGroups.map((muscleGroup) => [muscleGroup, 0]));
	data.meso.splitExercises.forEach((workout) => {
		let targetedMusclesOnDay: Set<string> = new Set();
		workout.forEach((exercise) => {
			muscleVolume[exercise.muscleTarget] += exercise.sets as number;
			targetedMusclesOnDay.add(exercise.muscleTarget);
		});
		targetedMusclesOnDay.forEach((muscleGroup) => {
			muscleFrequency[muscleGroup]++;
		});
	});

	let callingNewActiveMesocycleEndpoint = false;
	let anotherMesoActiveModal: HTMLDialogElement;
	let successModal: HTMLDialogElement;
	let errorModal: HTMLDialogElement;
	async function startMesocycle(endActiveMeso = false) {
		const mesoID = parseInt(data.mesoIndex);
		if (mesoID < 0 || Number.isNaN(mesoID)) {
			return;
		}
		if (data.parentMesocycle && !endActiveMeso) {
			anotherMesoActiveModal.show();
			return;
		}
		const reqJSON: APIActiveMesocycleCreate = {
			activeMesocycle: {
				mesoID,
				startDate: +new Date(),
				workouts: []
			}
		};
		callingNewActiveMesocycleEndpoint = true;
		const response = await fetch('/api/activeMesocycle/create', {
			method: 'POST',
			body: JSON.stringify(reqJSON),
			headers: {
				'content-type': 'application/json'
			}
		});
		if (response.ok) {
			await invalidateAll();
			successModal.show();
		} else {
			errorMsg = await response.text();
			errorModal.show();
		}
		callingNewActiveMesocycleEndpoint = false;
	}

	let callingStopActiveMesocycleEndpoint = false;
	let stopSuccessModal: HTMLDialogElement;
	async function stopMesocycle() {
		callingStopActiveMesocycleEndpoint = true;
		const response = await fetch('/api/activeMesocycle/delete', {
			method: 'POST'
		});
		if (response.ok) {
			stopSuccessModal.show();
			await invalidateAll();
		} else {
			errorMsg = await response.text();
			errorModal.show();
		}
		callingStopActiveMesocycleEndpoint = false;
	}
</script>

<MyModal title="Another mesocycle is already active" titleColor="text-warning" bind:dialogElement={anotherMesoActiveModal}>
	{#if data.parentMesocycle}
		<p>
			Would you like to end
			<span class="italic font-semibold">
				{data.parentMesocycle.name}
			</span>
			?
		</p>
		<div class="join w-full mt-4 grid grid-cols-2">
			<button class="btn join-item">No</button>
			<button
				class="btn btn-warning join-item"
				on:click={() => {
					startMesocycle(true);
				}}>Yes</button
			>
		</div>
	{/if}
</MyModal>
<MyModal title="Success" titleColor="text-success" bind:dialogElement={successModal}>
	<p>
		Mesocycle <span class="italic font-semibold">{data.meso.name}</span>
		has been activated
	</p>
</MyModal>
<MyModal title="Error" titleColor="text-error" bind:dialogElement={errorModal}>
	<p>{errorMsg}</p>
</MyModal>
<MyModal title="Delete Mesocycle" titleColor="text-error" bind:dialogElement={confirmDeleteModal}>
	<p>
		Are you sure you want to delete mesocycle
		<span class="font-semibold italic">{data.meso?.name}</span>?
	</p>
	<div class="join grid grid-cols-2 w-full mt-4">
		<form on:submit|preventDefault class="join-item">
			<button
				class="join-item btn btn-error text-black w-full"
				on:click={() => {
					if (!callingEndpoint) {
						deleteMesocycle();
					}
				}}
			>
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
<MyModal title="Success" titleColor="text-success" bind:dialogElement={stopSuccessModal}>
	<p>Mesocycle {data.meso.name} has been stopped</p>
</MyModal>

<div class="flex flex-col w-full gap-2 grow overflow-y-auto h-px mb-3">
	<div class="stats bg-primary shrink-0">
		<div class="stat">
			<div class="flex justify-between">
				<div class="opacity-90">Name</div>
				{#if data.parentMesocycleIndex === parseInt(data.mesoIndex)}
					<span class="badge badge-accent font-semibold">Active</span>
				{/if}
			</div>
			<div class="text-2xl font-bold text-white">{data.meso?.name}</div>
		</div>
	</div>
	<div class="stats bg-primary shrink-0">
		<div class="stat">
			<div class="opacity-90">Duration</div>
			<div class="text-2xl font-bold text-white">
				{#if data.meso?.duration && data.meso?.duration >= 4 && data.meso?.duration <= 16}
					{data.meso?.duration} weeks
				{:else}
					<span class="text-warning">{data.meso?.duration} weeks</span>
				{/if}
			</div>
		</div>
		<div class="stat">
			<div class="opacity-90">Start RIR</div>
			<div class="text-2xl font-bold text-white">{data.meso?.startRIR} RIR</div>
		</div>
	</div>
	<div class="stats bg-primary shrink-0">
		<div class="stat">
			<div class="opacity-90">Split</div>
			<div class="flex flex-col gap-1.5 mt-3">
				{#each data.meso?.splitSchedule as splitDay, i}
					<div class="join">
						<p class="join-item pl-2 basis-14 text-black shrink-0 font-semibold bg-secondary">
							{days[i]}
						</p>
						<p class="join-item grow text-center bg-black">
							{splitDay}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
	<div class="stats bg-primary shrink-0">
		<div class="stat">
			<div class="opacity-90">Volume</div>
			<div class="flex flex-col gap-1 mt-3">
				{#each commonMuscleGroups as muscleGroup}
					<MuscleGroupComponent
						bgColorClass="bg-black"
						{muscleGroup}
						freq={muscleFrequency[muscleGroup]}
						volume={muscleVolume[muscleGroup]}
					/>
				{/each}
			</div>
		</div>
	</div>
	<div class="stats bg-primary shrink-0">
		<div class="stat">
			<div class="opacity-90">Usages</div>
			<div class="flex flex-col gap-1 mt-3 text-white">
				{#if data.activeMesocycle && data.parentMesocycleIndex === parseInt(data.mesoIndex)}
					<a class="btn text-accent font-semibold" href="/mesocycles/active">{dateFormatter(data.activeMesocycle.startDate)}</a>
				{/if}
				{#if data.performedMesocycles}
					{#each data.performedMesocycles as performedMesocycle, i}
						{#if performedMesocycle.mesoID === parseInt(data.mesoIndex)}
							<a class="btn font-semibold" href="/mesocycles/performed/{i}">
								{dateFormatter(performedMesocycle.startDate)} - {dateFormatter(performedMesocycle.endDate)}
							</a>
						{/if}
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>

<div class="join grid grid-cols-3 w-full mt-auto">
	<button
		class="join-item btn btn-error text-black"
		on:click={() => {
			confirmDeleteModal.show();
		}}
	>
		Delete
	</button>
	<a href="/mesocycles/edit/{data.mesoIndex}" class="join-item btn btn-primary">
		{#if $navigating?.to?.url.pathname === `/mesocycles/edit/${data.mesoIndex}`}
			<span class="loading loading-spinner" />
		{/if}
		Edit
	</a>
	{#if data.parentMesocycleIndex !== parseInt(data.mesoIndex)}
		<button
			class="join-item btn btn-accent"
			on:click={() => {
				if (!callingNewActiveMesocycleEndpoint) {
					startMesocycle();
				}
			}}
		>
			{#if callingNewActiveMesocycleEndpoint}
				<span class="loading loading-spinner" />
			{/if}
			Start
		</button>
	{:else}
		<button
			class="join-item btn btn-warning"
			on:click={() => {
				if (!callingStopActiveMesocycleEndpoint) {
					stopMesocycle();
				}
			}}
		>
			{#if callingStopActiveMesocycleEndpoint}
				<span class="loading loading-spinner" />
			{/if}
			Stop
		</button>
	{/if}
</div>
