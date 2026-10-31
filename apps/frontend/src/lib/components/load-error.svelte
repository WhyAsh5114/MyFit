<script lang="ts">
	import { page } from '$app/state';
	import ResponsiveDialog from '#lib/components/responsive-dialog.svelte';
	import StateBackdrop from '#lib/components/state-backdrop.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { m } from '#lib/paraglide/messages.js';

	$effect(() => {
		console.error('A page could not load its data', page.error);
	});
</script>

<StateBackdrop scene="salad" />
<ResponsiveDialog
	title={m['errors.pageLoadFailed']()}
	description={m['account.loadFailedHint']()}
	dismissible={false}
>
	{#snippet footer()}
		<Button onclick={() => location.reload()}>{m['account.reload']()}</Button>
	{/snippet}
</ResponsiveDialog>
