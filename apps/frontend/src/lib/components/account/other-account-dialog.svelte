<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ResponsiveDialog from '#lib/components/responsive-dialog.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { signOutAndRefreshSession } from '#lib/services/account/logout.js';
	import { m } from '#lib/paraglide/messages.js';

	/** `email` owns the unsynced local data that the new login would replace. */
	let { email, ondiscard }: { email: string; ondiscard: () => void } = $props();

	let leaving = $state(false);
	let error = $state<string | null>(null);

	/** Signs out of the new login and returns to sign-in, so the local account can log back in. */
	async function keepLocalData() {
		leaving = true;
		error = null;
		try {
			await signOutAndRefreshSession();
			await goto(resolve('login'));
		} catch (cause) {
			console.error('Could not sign out', cause);
			error = m['account.otherAccountSignOutFailed']();
		} finally {
			leaving = false;
		}
	}
</script>

<ResponsiveDialog
	title={m['account.otherAccountTitle']()}
	description={m['account.otherAccountDescription']({ email })}
	dismissible={false}
>
	{#if error}
		<p role="alert" class="text-sm text-destructive">{error}</p>
	{/if}
	{#snippet footer()}
		<Button variant="outline" disabled={leaving} onclick={keepLocalData}>
			{m['account.otherAccountKeep']()}
		</Button>
		<Button variant="destructive" disabled={leaving} onclick={ondiscard}>
			{m['account.otherAccountDiscard']()}
		</Button>
	{/snippet}
</ResponsiveDialog>
