<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';

	let savingWorkout = $state(false);

	async function saveWorkout() {
		savingWorkout = true;

		savingWorkout = false;
	}
</script>

<div class="mt-auto grid grid-cols-2 gap-1">
	<Button variant="secondary" onclick={() => window.history.back()}>Previous</Button>
	<Button onclick={saveWorkout} disabled={savingWorkout}>
		{#if savingWorkout}
			<LoaderCircle />
		{:else}
			Save
		{/if}
	</Button>
</div>
