<script lang="ts">
	import ResponsiveDialog from '$lib/components/responsive-dialog.svelte';
	import { Button } from '$lib/components/ui/button';
	import { cancelLogout, logout } from '$lib/features/logout';
	import { m } from '$lib/paraglide/messages';
</script>

<ResponsiveDialog
	title={m['account.logoutFailed']()}
	description={m['account.logoutUnsynced']()}
	closeLabel={m['account.logoutCancel']()}
	onclose={cancelLogout}
>
	{#snippet footer()}
		<Button variant="outline" onclick={() => logout()}>{m['account.logoutRetry']()}</Button>
		<Button variant="destructive" onclick={() => logout(true)}>
			{m['account.logoutDiscard']()}
		</Button>
	{/snippet}
</ResponsiveDialog>
