<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	import MuscleGroupComponent from '$lib/components/mesocycle/MuscleGroupComponent.svelte';
	import MyModal from '$lib/components/MyModal.svelte';
	import { commonMuscleGroups, days } from '$lib/commonDB';

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
				mesoIndex: data.mesoIndex
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

	let muscleFrequency = Object.fromEntries(
		commonMuscleGroups.map((muscleGroup) => [muscleGroup, 0])
	);
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

<div class="flex flex-col w-full gap-2 grow overflow-y-auto h-px mb-3">
	<div class="stats bg-primary shrink-0">
		<div class="stat">
			<div class="opacity-75">Name</div>
			<div class="text-2xl font-bold text-white">{data.meso?.name}</div>
		</div>
	</div>
	<div class="stats bg-primary shrink-0">
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
	<div class="stats bg-primary shrink-0">
		<div class="stat">
			<div class="opacity-75">Split</div>
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
			<div class="opacity-75">Volume</div>
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
	<a href="/mesocycles/edit/{data.mesoIndex}" class="join-item btn btn-primary">
		{#if $navigating?.to?.url.pathname === `/mesocycles/edit/${data.mesoIndex}`}
			<span class="loading loading-spinner" />
		{/if}
		Edit
	</a>
</div>
