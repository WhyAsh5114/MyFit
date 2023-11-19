<script lang="ts">
	export let dialogElement: HTMLDialogElement;
	export let title: string;
	export let titleColor = "text-accent";
	export let onClose: () => void = () => {
		/* don't do anything on close by default */
	};

	$: if (/success/i.test(title)) {
		titleColor = "text-accent";
	} else if (/error/i.test(title) || /delete/i.test(title)) {
		titleColor = "text-error";
	}
</script>

<dialog
	id={title}
	class="modal modal-bottom sm:modal-middle"
	bind:this={dialogElement}
	on:close={onClose}
>
	<form method="dialog" class="modal-box bg-primary text-white">
		<button class="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
		<h2 class="font-bold text-lg {titleColor} mb-5">{title}</h2>
		<slot />
	</form>
	<form method="dialog" class="modal-backdrop bg-black bg-opacity-50">
		<button>close</button>
	</form>
</dialog>
