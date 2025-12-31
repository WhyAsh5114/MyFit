<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import ResponsiveDialog from '$lib/components/responsive-dialog.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { SERVICE_WORKER_UPDATE_INTERVAL } from '$lib/constants';
	import { client } from '$lib/clients/idb-client';
	import { LoaderCircleIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { useRegisterSW } from 'virtual:pwa-register/svelte';
	import { appLayoutState } from './app-layout-state.svelte';

	let progress = $state<number>();
	let progressToast = $state<string | number>();
	let updating = $state(false);

	function checkForUpdate(r: ServiceWorkerRegistration) {
		console.log('Checking for SW update');
		appLayoutState.lastChecked = new Date();
		r.update();
	}

	async function showLoadingProgress() {
		const response = await fetch('./precache-entries.json');
		const { count } = (await response.json()) as { count: number };
		const cache = await caches.open(`workbox-precache`);

		const updateProgress = async () => {
			const totalCached = (await cache.keys()).length;
			progress = totalCached / count;

			if (totalCached < count) {
				requestAnimationFrame(updateProgress);
			}
		};
		updateProgress();
	}

	const { updateServiceWorker } = useRegisterSW({
		async onRegisteredSW(swScriptUrl, r) {
			if (!r) return;
			console.log('SW registered', swScriptUrl);
			setInterval(() => checkForUpdate(r), SERVICE_WORKER_UPDATE_INTERVAL);
			appLayoutState.swRegistration = r;
			if (r.installing) await showLoadingProgress();
		},
		onRegisterError(error) {
			toast.error('Failed to register offline capabilities');
			console.log('SW registration error', error);
		},
		onNeedRefresh() {
			if (dev) return;
			appLayoutState.updateServiceWorkerFunction = async () => {
				await client.resetDatabase();
				await updateServiceWorker();
				window.location.reload();
			};
			appLayoutState.updateDialogOpen = true;
		}
	});

	$effect(() => {
		if (!progress) return;
		if (page.url.pathname === '/') {
			if (progressToast !== undefined) toast.dismiss(progressToast);
			return;
		}

		progressToast = toast.promise(
			new Promise<void>((resolve) => {
				if (progress !== 1) return;
				resolve();
				progress = 0;
			}),
			{
				id: progressToast,
				loading: `Preparing app ${Math.round(progress * 100)}%`,
				success: 'App ready for offline use'
			}
		);
	});

	$effect(() => {
		if (typeof window === 'undefined') return;

		const installHandler = (e: Event) => {
			e.preventDefault();
			appLayoutState.deferredPrompt = e as Event & { prompt: () => void };
		};
		window.addEventListener('beforeinstallprompt', installHandler);

		const installedHandler = () => {
			appLayoutState.deferredPrompt = undefined;
		};
		window.addEventListener('appinstalled', installedHandler);

		return () => {
			window.removeEventListener('beforeinstallprompt', installHandler);
			window.removeEventListener('appinstalled', installedHandler);
		};
	});
</script>

<ResponsiveDialog bind:open={appLayoutState.updateDialogOpen}>
	{#snippet title()}
		Update available 🎉
	{/snippet}
	{#snippet description()}
		Any unsaved data, like a workout in progress, will be lost. Are you sure you want to update now?
	{/snippet}
	<Button
		disabled={updating}
		onclick={() => {
			updating = true;
			appLayoutState.updateServiceWorkerFunction!();
		}}
	>
		{#if updating}
			<LoaderCircleIcon class="animate-spin" />
		{:else}
			Yes, update
		{/if}
	</Button>
</ResponsiveDialog>
