<script lang="ts">
	import { getSerwist } from 'virtual:serwist';
	import { appLayoutState } from './app-layout-state.svelte';
	import { toast } from 'svelte-sonner';
	import { dev } from '$app/environment';
	import ResponsiveDialog from '$lib/components/responsive-dialog.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { LoaderCircleIcon } from 'lucide-svelte';

	let updateInterval = $state<ReturnType<typeof setInterval>>();
	let progress = $state<number>();
	let progressToast = $state<string | number>();
	let updating = $state(false);

	$effect(() => {
		if (dev) return;

		const loadSerwist = async () => {
			if ('serviceWorker' in navigator) {
				const serwist = await getSerwist();
				if (!serwist) return;

				serwist.addEventListener('installed', () => {
					console.log('Serwist installed!');
				});
				await serwist.register();

				const checkForUpdate = () => {
					try {
						appLayoutState.lastChecked = new Date();
						serwist.update();
					} catch (error) {
						console.error(error);
					}
				};
				checkForUpdate();
				updateInterval = setInterval(checkForUpdate, 1000 * 60 * 60);

				serwist.addEventListener('waiting', () => {
					appLayoutState.skipWaitingFunction = () => serwist.messageSkipWaiting();
				});

				serwist.addEventListener('controlling', (event) => {
					if (event.isUpdate || event.isExternal) {
						localStorage.clear();
						location.reload();
					}
				});

				serwist.addEventListener('installing', async (event) => {
					if (event.isUpdate || event.isExternal) return;

					const response = await fetch('./precache-entries.json');
					const { count } = (await response.json()) as { count: number };
					const cache = await caches.open(`serwist-precache`);

					let animationFrameId: number;
					const updateProgress = async () => {
						const totalCached = (await cache.keys()).length;
						progress = totalCached / count;

						if (totalCached < count) {
							animationFrameId = requestAnimationFrame(updateProgress);
						}
					};

					updateProgress();
					return () => {
						if (animationFrameId) cancelAnimationFrame(animationFrameId);
					};
				});
			}

			return () => {
				clearInterval(updateInterval);
			};
		};
		loadSerwist();
	});

	$effect(() => {
		if (!progress) return;

		progressToast = toast.promise(
			new Promise<void>((resolve) => {
				if (progress === 1) resolve();
			}),
			{
				id: progressToast,
				loading: `Installing ${Math.round(progress * 100)}%`,
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

	$effect(() => {
		if (appLayoutState.skipWaitingFunction) {
			appLayoutState.updateDialogOpen = true;
		}
	});
</script>

<ResponsiveDialog title="Update available 🎉" bind:open={appLayoutState.updateDialogOpen}>
	{#snippet description()}
		Any unsaved data, like a workout in progress, will be lost. Are you sure you want to update now?
	{/snippet}
	<Button
		disabled={updating}
		onclick={() => {
			updating = true;
			appLayoutState.skipWaitingFunction!();
		}}
	>
		{#if updating}
			<LoaderCircleIcon class="animate-spin" />
		{:else}
			Yes, update
		{/if}
	</Button>
</ResponsiveDialog>
