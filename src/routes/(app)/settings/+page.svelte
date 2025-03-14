<script lang="ts">
	import { dev } from '$app/environment';
	import H1 from '$lib/components/typography/h1.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { LoaderCircleIcon, RefreshCcwIcon } from 'lucide-svelte';
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
	<Card.Content>
		{#if appLayoutState.skipWaitingFunction}
			<Button onclick={() => (appLayoutState.updateDialogOpen = true)}>
				<RefreshCcwIcon /> Update and refresh
			</Button>
		{:else if swStatus === 'checking'}
			<Button disabled>
				<LoaderCircleIcon class="animate-spin" /> Checking for updates
			</Button>
		{:else if swStatus === undefined}
			<Button onclick={checkForUpdate}><RefreshCcwIcon /> Check now</Button>
		{:else}
			<Button disabled>
				<LoaderCircleIcon class="animate-spin" /> Installing update
			</Button>
		{/if}
	</Card.Content>
</Card.Root>
