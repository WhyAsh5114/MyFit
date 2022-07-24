<script lang="ts">
	export let modalOpen = false;
	export let modalTitle: string;
	export let modalTexts: string[] = [];
	export let onClose: () => void = () => {};

	let modalTitleColor = 'text-white';

	// The dollar means re-run whenever referenced value (modalTitle) is changed
	// Whenever modalTitle is changed we want to change the color of it as well
	$: if (modalTitle == 'Error') {
		modalTitleColor = 'text-red-500';
	} else if (modalTitle == 'Success') {
		modalTitleColor = 'text-green-500';
	} else if (modalTitle == 'Warning') {
		modalTitleColor = 'text-yellow-500';
	}
</script>

<input type="checkbox" id="my-modal" class="modal-toggle" bind:checked={modalOpen} />
<label
	for="my-modal"
	class="modal modal-bottom md:modal-middle cursor-pointer"
	on:click={() => {
		onClose();
	}}
>
	<label class="modal-box relative bg-primary" for="">
		<h3 class="text-lg font-bold {modalTitleColor}">{modalTitle}</h3>
		<ul class="py-4" data-test-id="modal-messages-list">
			{#each modalTexts as text}
				<li>{text}</li>
			{/each}
		</ul>
	</label>
</label>
