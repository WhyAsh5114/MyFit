<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import MyModal from '$lib/components/MyModal.svelte';
	import {
		isBasicsValidStore,
		isSplitValidStore,
		isExercisesValidStore,
		errorMsgs,
		mesoName,
		duration,
		startRIR,
		splitSchedule,
		splitExercises
	} from './newMesoStore';

	const steps = ['basics', 'split', 'exercises', 'overview'];
	$: currentStepIndex = steps.indexOf($page.url.pathname.split('/').at(-1) as string);

	function goNext() {
		if (currentStepIndex === 0 && !$isBasicsValidStore()) {
			invalidDataOnPageModal.show();
			return false;
		} else if (currentStepIndex === 1 && !$isSplitValidStore()) {
			invalidDataOnPageModal.show();
			return false;
		} else if (currentStepIndex === 2 && !$isExercisesValidStore()) {
			invalidDataOnPageModal.show();
			return false;
		}
		goto($page.url.pathname.replace(steps[currentStepIndex], steps[currentStepIndex + 1]));
	}

	function goPrev() {
		goto($page.url.pathname.replace(steps[currentStepIndex], steps[currentStepIndex - 1]));
	}

	let invalidDataOnPageModal: HTMLDialogElement;

	let callingEndpoint = false;
	async function createMesocycle() {
		callingEndpoint = true;
		const meso: Mesocycle = {
			name: $mesoName,
			duration: $duration,
			startRIR: $startRIR,
			splitSchedule: $splitSchedule,
			splitExercises: $splitExercises
		};
		const reqJSON: APIMesocyclesCreate = { meso };
		const response = await fetch('/api/mesocycles/create', {
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
			$errorMsgs = [await response.text()];
			invalidDataOnPageModal.show();
		}
	}
	let successModal: HTMLDialogElement;
</script>

<MyModal
	title="Success"
	titleColor="text-success"
	bind:dialogElement={successModal}
	onClose={() => {
		goto('/');
		// Clear stores
		$mesoName = '';
		$duration = 6;
		$startRIR = 3;
		$splitSchedule = ['', '', '', '', '', '', ''];
		$splitExercises = [[], [], [], [], [], [], []];
	}}
>
	<p>Mesocycle <span class="font-semibold italic">{$mesoName}</span> created successfully</p>
</MyModal>
<MyModal title="Error" titleColor="text-error" bind:dialogElement={invalidDataOnPageModal}>
	<ul class="list-disc ml-5">
		{#each $errorMsgs as msg}
			<li>{msg}</li>
		{/each}
	</ul>
</MyModal>
<ul class="steps bg-primary rounded-md w-full py-1.5 mb-auto shrink-0">
	{#each steps as step}
		{#if steps.indexOf(step) <= currentStepIndex}
			<li class="step step-accent uppercase text-sm font-semibold">
				<a href="/mesocycles/new/{step}">{step}</a>
			</li>
		{:else}
			<li class="step uppercase text-sm font-semibold">{step}</li>
		{/if}
	{/each}
</ul>
<slot />
<div class="join w-full gap-1 mt-auto grid grid-cols-2">
	<button
		class="btn btn-primary join-item {currentStepIndex === 0 ? 'btn-disabled opacity-50' : ''}"
		on:click={goPrev}>Previous</button
	>
	{#if currentStepIndex !== 3}
		<button class="btn btn-primary join-item" on:click={goNext}>Next</button>
	{:else}
		<button
			class="btn btn-accent join-item {callingEndpoint ? 'disabled' : ''}"
			on:click={createMesocycle}
		>
			{#if callingEndpoint}
				<span class="loading loading-spinner" />
			{/if}
			Create
		</button>
	{/if}
</div>
