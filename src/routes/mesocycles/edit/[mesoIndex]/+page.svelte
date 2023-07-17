<script lang="ts">
	import MyModal from '$lib/components/MyModal.svelte';
	import { duration, mesoName, splitExercises, splitSchedule, startRIR } from './editMesoStore';
	import { days } from '$lib/commonDB';
	import { navigating } from '$app/stores';
	import { goto } from '$app/navigation';
	export let data;

	const meso = data.meso;
	mesoName.set(meso.name);
	duration.set(meso.duration);
	startRIR.set(meso.startRIR);
	splitSchedule.set(meso.splitSchedule);
	splitExercises.set(meso.splitExercises);

	let durationHelpModal: HTMLDialogElement;
	let startRIRHelpModal: HTMLDialogElement;
	let mesoNameInput: HTMLInputElement;

	let callingEndpoint = false;
	let errorMsg = '';
	async function saveMesocycle() {
		callingEndpoint = true;
		const newMesocycle: Mesocycle = {
			name: $mesoName,
			duration: $duration,
			startRIR: $startRIR,
			splitSchedule: $splitSchedule,
			splitExercises: $splitExercises
		};
		const reqJSON: APIMesocyclesUpdate = {
			mesoIndex: parseInt(data.mesoIndex),
			meso: newMesocycle
		};
		const response = await fetch('/api/mesocycles/update', {
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

	let successModal: HTMLDialogElement;
	let errorModal: HTMLDialogElement;
</script>

<MyModal
	title="Success"
	titleColor="text-success"
	bind:dialogElement={successModal}
	onClose={() => {
		goto(`/mesocycles/view/${data.mesoIndex}`);
	}}
>
	<p>
		Mesocycle <span class="font-semibold italic">{data.meso.name}</span> has been updated successfully
	</p>
</MyModal>

<MyModal title="Error" titleColor="text-error" bind:dialogElement={errorModal}>
	<p>{errorMsg}</p>
</MyModal>

<MyModal title="Mesocycle duration" titleColor="text-accent" bind:dialogElement={durationHelpModal}>
	<p>The ideal range of a mesocycle duration is between 4 and 16 weeks. It depends on various factors like:</p>
	<ul class="ml-5 list-disc mt-2">
		<li>Start RIR (higher the RIR, longer the mesocycle can be)</li>
		<li>Caloric balance (a surplus can sustain longer mesocycles)</li>
	</ul>
</MyModal>

<MyModal title="Start Reps In Reserve" titleColor="text-accent" bind:dialogElement={startRIRHelpModal}>
	<p>The RIR to begin the mesocycle with, or the RIR for the first microcycle.</p>
	<p>The recommended RIR for the beginning of a meso is around 3 RIR.</p>
	<ul class="ml-5 list-disc mt-2">
		<li>Going much lower can bring in excessive fatigue when you are fresh from a deload</li>
		<li>Going much higher can result in wasted workouts which weren't stimulative enough for hypertrophy</li>
	</ul>
</MyModal>

<div class="flex flex-col overflow-y-auto h-px grow w-full gap-2">
	<div class="flex flex-col bg-primary p-5 rounded-lg w-full">
		<h3 class="card-title">Mesocycle name</h3>
		<div class="h-0.5 bg-black mt-1 mb-4" />
		<input
			type="text"
			placeholder="Type here"
			class="input input-sm w-full"
			bind:value={$mesoName}
			bind:this={mesoNameInput}
			on:click={() => {
				mesoNameInput.classList.remove('ring-2', 'ring-error', 'animate-pulse');
			}}
		/>
	</div>

	<div class="flex flex-col bg-primary p-5 rounded-lg w-full">
		<div class="flex justify-between">
			<h3 class="card-title">Mesocycle duration</h3>
			<button class="help-button" on:click={() => durationHelpModal.show()}>?</button>
		</div>
		<div class="h-0.5 bg-black mt-1 mb-4" />
		<div class="flex items-center gap-2">
			<p class="text-center basis-28 bg-black rounded-md text-sm py-1">{$duration} weeks</p>
			<input
				type="range"
				min="2"
				max="20"
				bind:value={$duration}
				class="range range-xs {$duration >= 4 && $duration <= 16 ? 'range-secondary' : 'range-warning'}"
			/>
		</div>
	</div>

	<div class="flex flex-col bg-primary p-5 rounded-lg w-full">
		<div class="flex justify-between">
			<h3 class="card-title">Start Reps In Reserve</h3>
			<button class="help-button" on:click={() => startRIRHelpModal.show()}>?</button>
		</div>
		<div class="h-0.5 bg-black mt-1 mb-4" />
		<select class="select select-sm select-bordered w-full" bind:value={$startRIR}>
			<option value={4}>4 RIR</option>
			<option value={3}>3 RIR</option>
			<option value={2}>2 RIR</option>
			<option value={1}>1 RIR</option>
		</select>
	</div>

	<div class="flex flex-col bg-primary p-5 rounded-lg w-full">
		<h3 class="card-title">Split</h3>
		<div class="h-0.5 bg-black mt-1 mb-4" />
		<div class="flex flex-col gap-1.5 w-full">
			{#each data.meso?.splitSchedule as splitDay, i}
				<div class="join">
					<p class="join-item pl-2 basis-14 text-black shrink-0 font-semibold bg-secondary">
						{days[i]}
					</p>
					<p class="join-item grow text-center bg-black">
						{splitDay}
					</p>
					{#if splitDay !== ''}
						<a
							class="join-item h-full bg-secondary flex items-center justify-center basis-8 shrink-0 grow-0"
							href="/mesocycles/edit/{data.mesoIndex}/workouts/{i}"
						>
							{#if $navigating?.to?.url.pathname === `/mesocycles/edit/${data.mesoIndex}/workouts/${i}`}
								<span class="loading loading-spinner text-black loading-sm" />
							{:else}
								<img src="/pencil.svg" alt="Edit icon" class="px-2" />
							{/if}
						</a>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<div class="join w-full grid grid-cols-2 mt-2">
	<a class="join-item btn btn-primary" href="/mesocycles/view/{data.mesoIndex}">
		{#if $navigating?.to?.url.pathname === `/mesocycles/view/${data.mesoIndex}`}
			<span class="loading loading-spinner" />
		{/if}
		Cancel
	</a>
	<button class="join-item btn btn-accent" on:click={saveMesocycle}>
		{#if callingEndpoint}
			<span class="loading loading-spinner" />
		{/if}
		Save
	</button>
</div>
