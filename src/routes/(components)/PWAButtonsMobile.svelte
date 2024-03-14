<script lang="ts">
	import { onMount } from 'svelte';
	import { useRegisterSW } from 'virtual:pwa-register/svelte';
	import type { Writable } from 'svelte/store';
	import DownloadIcon from 'virtual:icons/material-symbols/download';
	import ReloadIcon from 'virtual:icons/tabler/reload';
	import Button from '$lib/components/ui/button/button.svelte';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';

	let deferredPrompt: Event | null;
	let needRefresh: Writable<boolean>;
	let offlineReady: Writable<boolean>;
	let showInstallButton = false;
	let updateServiceWorker: (_arg0: boolean) => void;
	onMount(() => {
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			showInstallButton = true;
		});
		window.addEventListener('appinstalled', () => {
			showInstallButton = false;
			deferredPrompt = null;
		});

		({ needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
			onRegisteredSW(swUrl, r) {
				r &&
					setInterval(async () => {
						if (!(!r.installing && navigator)) {
							return;
						}
						if ('connection' in navigator && !navigator.onLine) {
							return;
						}
						const resp = await fetch(swUrl, {
							cache: 'no-store',
							headers: {
								cache: 'no-store',
								'cache-control': 'no-cache'
							}
						});
						if (resp.status === 200) {
							await r.update();
						}
					}, 600000 /* Every 10 minutes */);
				console.log(`SW Registered: ${r}`);
			},
			onRegisterError(error) {
				console.log('SW registration error', error);
			}
		}));
	});

	let reloading = false;
</script>

{#if $needRefresh}
	<Button
		variant="ghost"
		size="icon"
		on:click={() => {
			updateServiceWorker(true);
			reloading = true;
		}}
	>
		{#if !reloading}
			<ReloadIcon class="h-5 w-5" />
		{:else}
			<LoaderCircle class="h-5 w-5 animate-spin" />
		{/if}
	</Button>
{:else if showInstallButton}
	<Button
		variant="ghost"
		size="icon"
		aria-label="Download"
		on:click={() => {
			// @ts-expect-error Not standard API yet, so need this ignore
			deferredPrompt.prompt();
			deferredPrompt = null;
		}}
	>
		<DownloadIcon class="h-6 w-6" />
	</Button>
{/if}
