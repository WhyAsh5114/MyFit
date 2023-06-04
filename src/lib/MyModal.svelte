<script lang="ts">
	let dialogElement: HTMLDialogElement;
	export let title: string;
	export let titleColor = 'text-white';
</script>

<button on:click={() => dialogElement.showModal()}>
	<slot name="openButton" />
</button>
<dialog id={title} class="modal" bind:this={dialogElement}>
	<form method="dialog" class="modal-box bg-primary">
		<h3 class="font-bold text-lg {titleColor} mb-5">{title}</h3>
		<slot name="content" />
	</form>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
