<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import MyModal from '$lib/MyModal.svelte';
	import { isValid, errorMsgs } from './newMesoStore';

	const steps = ['basics', 'split', 'exercises', 'volume'];
	$: currentStepIndex = steps.indexOf($page.url.pathname.split('/').at(-1) as string);

	function goNext() {
		if (!$isValid()) {
			invalidDataOnPageModal.show();
			return false;
		}
		goto($page.url.pathname.replace(steps[currentStepIndex], steps[currentStepIndex + 1]));
	}

	function goPrev() {
		goto($page.url.pathname.replace(steps[currentStepIndex], steps[currentStepIndex - 1]));
	}

	let invalidDataOnPageModal: HTMLDialogElement;
</script>

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
<div class="join w-full gap-1 mt-auto">
	<button
		class="btn btn-primary join-item w-1/2 {currentStepIndex === 0
			? 'btn-disabled opacity-50'
			: ''}"
		on:click={goPrev}>Previous</button
	>
	{#if currentStepIndex !== 3}
		<button class="btn btn-primary join-item w-1/2" on:click={goNext}>Next</button>
	{:else}
		<button class="btn btn-accent join-item w-1/2">Save</button>
	{/if}
</div>
