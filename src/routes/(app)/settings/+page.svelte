<script lang="ts">
	import { dev } from '$app/environment';
	import H1 from '$lib/components/typography/h1.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { client } from '$lib/idb-client';
	import { createMutation } from '@tanstack/svelte-query';
	import { LoaderCircleIcon, RefreshCcwIcon, RotateCwIcon } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { getSerwist } from 'virtual:serwist';
	import { appLayoutState } from '../components/app-layout-state.svelte';

	let swStatus = $state<'checking' | 'installing' | 'waiting' | undefined>();

	async function checkForUpdate() {
		if (dev) return;

		swStatus = 'checking';
		if ('serviceWorker' in navigator) {
			try {
				const sw = await getSerwist();
				if (!sw) return;
				await sw.register();

				sw.addEventListener('installing', () => {
					swStatus = 'installing';
				});

				sw.addEventListener('waiting', () => {
					swStatus = 'waiting';
				});

				await sw.update();
			} catch (error) {
				swStatus = undefined;
				toast.error('Failed to check for updates');
				console.error(error);
			}
			await new Promise((resolve) => setTimeout(resolve, 1000));
			if (swStatus === 'checking') {
				swStatus = undefined;
				toast.success('App is already at the latest version');
			}
			appLayoutState.lastChecked = new Date();
		} else {
			swStatus = undefined;
		}
	}

	let resetDatabaseMutation = createMutation({
		mutationFn: async () => {
			await client.resetDatabase();
			toast.success('IndexedDB cleared');
			location.reload();
		}
	});
</script>

<H1>Settings</H1>

<Card.Root>
	<Card.Header>
		<Card.Title>Check for updates</Card.Title>
		<Card.Description>
			Last checked at: <span class="font-semibold">
				{appLayoutState.lastChecked ?? 'Not checked'}
			</span>
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex justify-end">
		{#if appLayoutState.skipWaitingFunction}
			<Button onclick={() => (appLayoutState.updateDialogOpen = true)}>
				Update and refresh <RefreshCcwIcon />
			</Button>
		{:else if swStatus === 'checking'}
			<Button disabled>
				Checking for updates <LoaderCircleIcon class="animate-spin" />
			</Button>
		{:else if swStatus === undefined}
			<Button onclick={checkForUpdate}>Check now <RefreshCcwIcon /></Button>
		{:else}
			<Button disabled>
				Installing update <LoaderCircleIcon class="animate-spin" />
			</Button>
		{/if}
	</Card.Content>
</Card.Root>

<Card.Root>
	<Card.Header>
		<Card.Title>Redo getting started</Card.Title>
		<Card.Description>
			Redo the questionnaire in case you missed it or want to change your answers
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex justify-end">
		<Button href="/getting-started">Redo <RotateCwIcon /></Button>
	</Card.Content>
</Card.Root>

<Card.Root>
	<Card.Header>
		<Card.Title>Clear IndexedDB</Card.Title>
		<Card.Description>
			Remove IndexedDB data stored in the app, for development purposes only
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex justify-end">
		<Button
			disabled={$resetDatabaseMutation.isPending}
			onclick={() => $resetDatabaseMutation.mutate()}
			variant="destructive"
		>
			{#if $resetDatabaseMutation.isPending}
				Clearing <LoaderCircleIcon class="animate-spin" />
			{:else}
				Clear <RotateCwIcon />
			{/if}
		</Button>
	</Card.Content>
</Card.Root>
