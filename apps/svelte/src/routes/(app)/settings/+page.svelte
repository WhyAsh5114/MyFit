<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { client } from '$lib/idb-client';
	import { LoaderCircleIcon, RefreshCcwIcon, RotateCwIcon, TrashIcon } from '@lucide/svelte';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { appLayoutState } from '../../_components/app-layout-state.svelte';

	function bytesToMB(bytes: number | undefined) {
		bytes = bytes ?? 0;
		return (bytes / 1024 / 1024).toFixed(2);
	}

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

	let offlineReady = createQuery(() => ({
		queryKey: ['offlineReady'],
		enabled: false,
		queryFn: async () => {
			if (!appLayoutState.swRegistration) {
				toast.error('Service Worker not registered');
				return null;
			}

			const storageEstimate = await navigator.storage.estimate();
			const description = `Storage usage: ${bytesToMB(storageEstimate.usage)} of ${bytesToMB(storageEstimate.quota)} MB`;

			const isOfflineReady = appLayoutState.swRegistration.active;
			if (isOfflineReady) toast.success(`App is offline ready`, { description });
			else toast.error(`App is not offline ready`, { description });

			return isOfflineReady;
		}
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
	<Card.Content class="flex justify-end">
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
	<Card.Content class="flex justify-end">
		<Button href="/getting-started" variant="outline">Redo <RotateCwIcon /></Button>
	</Card.Content>
</Card.Root>

<Card.Root class="gap-4">
	<Card.Header>
		<Card.Title>Clear IndexedDB</Card.Title>
		<Card.Description>
			Remove IndexedDB data stored in the app, for development purposes only
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex justify-end">
		<Button
			disabled={resetDatabaseMutation.isPending}
			onclick={() => resetDatabaseMutation.mutate()}
			variant="destructive"
		>
			{#if resetDatabaseMutation.isPending}
				Clearing <LoaderCircleIcon class="animate-spin" />
			{:else}
				Clear <TrashIcon />
			{/if}
		</Button>
	</Card.Content>
</Card.Root>

<Card.Root class="gap-4">
	<Card.Header>
		<Card.Title>Offline status</Card.Title>
		<Card.Description>
			Check whether the app can run offline and currently used storage space
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex justify-end">
		<Button variant="outline" onclick={() => offlineReady.refetch()}>
			Check <RefreshCcwIcon />
		</Button>
	</Card.Content>
</Card.Root>
