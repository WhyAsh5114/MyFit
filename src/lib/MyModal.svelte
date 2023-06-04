<script lang="ts">
	export let dialogElement: HTMLDialogElement;
	export let title: string;
	export let titleColor = 'text-white';
</script>

<dialog id={title} class="modal modal-bottom sm:modal-middle" bind:this={dialogElement}>
	<form method="dialog" class="modal-box bg-primary text-white">
		<button class="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
		<h3 class="font-bold text-lg {titleColor} mb-5">{title}</h3>
		<slot />
	</form>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
