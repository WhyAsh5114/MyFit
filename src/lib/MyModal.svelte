<script lang="ts">
	export let modalOpen = false;
	export let modalTexts: string[] = [];
</script>

<input type="checkbox" id="my-modal" class="modal-toggle" bind:checked={modalOpen} />
<label for="my-modal" class="modal cursor-pointer">
	<label
		class="modal-box relative bg-primary"
		for=""
		on:click|self={() => {
			modalOpen = false;
		}}
	>
		<h3 class="text-lg font-bold text-error">Error</h3>
		<ul class="py-4" data-test-id="modal-messages-list">
			{#each modalTexts as text}
				<li>{text}</li>
			{/each}
		</ul>
	</label>
</label>
