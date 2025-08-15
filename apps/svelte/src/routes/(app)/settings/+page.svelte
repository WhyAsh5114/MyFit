<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { client } from '$lib/idb-client';
	import { LoaderCircleIcon, RefreshCcwIcon, RotateCwIcon, TrashIcon } from '@lucide/svelte';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { appLayoutState } from '../../_components/app-layout-state.svelte';

	let resetDatabaseMutation = createMutation(() => ({
		mutationFn: async () => {
			await client.resetDatabase();
			toast.success('IndexedDB cleared');
			location.reload();
		},
		onError: (error) => {
			toast.error('Failed to clear IndexedDB');
			console.error('Error clearing IndexedDB:', error);
		}
	}));

	let checkForUpdate = createQuery(() => ({
		queryFn: async () => {
			if (!appLayoutState.swRegistration) {
				toast.error('Service Worker not registered');
				return null;
			}

			try {
				await appLayoutState.swRegistration.update();
				appLayoutState.lastChecked = new Date();
			} catch (error) {
				toast.error('Failed to check for updates');
				console.error('Error checking for updates:', error);
				return null;
			}

			// Wait for new registration to occur and sync state
			await new Promise((resolve) => setTimeout(resolve, 5000));

			if (appLayoutState.updateServiceWorkerFunction === undefined) {
				toast.success('App is already at the latest version');
				return null;
			}

			return true;
		},
		queryKey: ['checkForUpdate'],
		enabled: false
	}));
</script>

<H1>Settings</H1>

<Card.Root class="gap-4">
	<Card.Header>
		<Card.Title>Check for updates</Card.Title>
		<Card.Description>
			Last checked at: <span class="font-semibold">
				{appLayoutState.lastChecked?.toLocaleString(undefined, {
					dateStyle: 'short',
					timeStyle: 'short'
				}) ?? 'Not checked'}
			</span>
		</Card.Description>
	</Card.Header>
	<Card.Content class="[&>button]:w-full">
		{#if appLayoutState.updateServiceWorkerFunction}
			<Button onclick={() => (appLayoutState.updateDialogOpen = true)}>
				Update and refresh <RefreshCcwIcon />
			</Button>
		{:else if checkForUpdate.isFetching}
			<Button disabled>
				Checking for updates <LoaderCircleIcon class="animate-spin" />
			</Button>
		{:else if checkForUpdate.data === true}
			<Button disabled>
				Installing update <LoaderCircleIcon class="animate-spin" />
			</Button>
		{:else}
			<Button onclick={() => checkForUpdate.refetch()}>
				Check now <RefreshCcwIcon />
			</Button>
		{/if}
	</Card.Content>
</Card.Root>

<Card.Root class="gap-4">
	<Card.Header>
		<Card.Title>Redo getting started</Card.Title>
		<Card.Description>
			Redo the questionnaire in case you missed it or want to change your answers
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<Button href="/getting-started" class="w-full">Redo <RotateCwIcon /></Button>
	</Card.Content>
</Card.Root>

<Card.Root class="gap-4">
	<Card.Header>
		<Card.Title>Clear IndexedDB</Card.Title>
		<Card.Description>
			Remove IndexedDB data stored in the app, for development purposes only
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<Button
			disabled={resetDatabaseMutation.isPending}
			onclick={() => resetDatabaseMutation.mutate()}
			variant="destructive"
			class="w-full"
		>
			{#if resetDatabaseMutation.isPending}
				Clearing <LoaderCircleIcon class="animate-spin" />
			{:else}
				Clear <TrashIcon />
			{/if}
		</Button>
	</Card.Content>
</Card.Root>
