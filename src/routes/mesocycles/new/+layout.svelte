<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	const steps = ['basics', 'split', 'exercises', 'volume'];
	$: currentStepIndex = steps.indexOf($page.url.pathname.split('/').at(-1) as string);

	function goNext() {
		goto($page.url.pathname.replace(steps[currentStepIndex], steps[currentStepIndex + 1]));
	}

	function goPrev() {
		goto($page.url.pathname.replace(steps[currentStepIndex], steps[currentStepIndex - 1]));
	}
</script>

<ul class="steps bg-primary rounded-md w-full py-1.5 mb-auto">
	{#each steps as step}
		{#if steps.indexOf(step) <= currentStepIndex}
			<li class="step step-accent capitalize">{step}</li>
		{:else}
			<li class="step capitalize">{step}</li>
		{/if}
	{/each}
</ul>
<slot />

<div class="join w-full gap-1">
	<button
		class="btn btn-primary join-item w-1/2 {currentStepIndex === 0
			? 'btn-disabled opacity-25'
			: ''}"
		on:click={goPrev}>Previous</button
	>
	{#if currentStepIndex !== 3}
		<button class="btn btn-primary join-item w-1/2" on:click={goNext}>Next</button>
	{:else}
		<button class="btn btn-accent join-item w-1/2">Save</button>
	{/if}
</div>
