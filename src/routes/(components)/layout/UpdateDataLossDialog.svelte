<script lang="ts">
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { updateDataLossDialog, updateServiceWorker } from './PWAFunctions.svelte';

	let updating = $state(false);

	function updateApp() {
		updating = true;
		const fieldsToKeep = ['myfit_terms_accepted', 'discord-dismiss', 'domain-move-dismiss', 'last-used-auth-provider'];
		const preservedValues: Record<string, string | null> = {};

		fieldsToKeep.forEach((field) => {
			preservedValues[field] = localStorage.getItem(field);
		});

		localStorage.clear();

		fieldsToKeep.forEach((field) => {
			if (preservedValues[field] !== null) {
				localStorage.setItem(field, preservedValues[field]!);
			}
		});

		updateServiceWorker!(true);
	}
</script>

<ResponsiveDialog title="Update app?" bind:open={updateDataLossDialog.open}>
	{#snippet description()}
		<p>Any unsaved data, like a workout in progress, or an unsaved mesocycle will be lost.</p>
	{/snippet}
	<Button disabled={updating} onclick={updateApp} class="gap-2">
		{#if updating}
			<LoaderCircle class="animate-spin" />
		{:else}
			Update
		{/if}
	</Button>
</ResponsiveDialog>
