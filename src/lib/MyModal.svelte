<script lang="ts">
	export let dialogElement: HTMLDialogElement;
	export let title: string;
	export let titleColor = 'text-white';
</script>

<dialog id={title} class="modal" bind:this={dialogElement}>
	<form method="dialog" class="modal-box bg-primary">
		<h3 class="font-bold text-lg {titleColor} mb-5">{title}</h3>
		<slot />
	</form>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
