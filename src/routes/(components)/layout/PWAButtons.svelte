<script lang="ts">
	import { onMount } from 'svelte';
	import { useRegisterSW } from 'virtual:pwa-register/svelte';
	import type { Writable } from 'svelte/store';
	import DownloadIcon from 'virtual:icons/lucide/download';
	import UpdateIcon from 'virtual:icons/lucide/refresh-cw';
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';

	let { isMobile }: { isMobile: boolean } = $props();

	let deferredPrompt: Event | null;
	let needRefresh: Writable<boolean> | undefined = $state();

	let reloading = $state(false);
	let showInstallButton = $state(false);
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

		({ needRefresh, updateServiceWorker } = useRegisterSW({
			onRegisteredSW(swUrl, r) {
				// eslint-disable-next-line @typescript-eslint/no-unused-expressions
				r &&
					setInterval(async () => {
						if (!(!r.installing && navigator)) return;
						if ('connection' in navigator && !navigator.onLine) return;
						const resp = await fetch(swUrl, {
							cache: 'no-store',
							headers: {
								cache: 'no-store',
								'cache-control': 'no-cache'
							}
						});
						if (resp.status === 200) await r.update();
					}, 3600000);
				console.log(`SW Registered: ${r}`);
			},
			onRegisterError(error) {
				console.log('SW registration error', error);
			}
		}));
	});

	function updateApplication() {
		reloading = true;
		updateServiceWorker(true);
		localStorage.clear();
	}
</script>

{#if isMobile}
	{#if $needRefresh}
		<Button onclick={updateApplication} size="icon" variant="ghost">
			<UpdateIcon class={cn({ 'animate-spin': reloading })} />
		</Button>
	{:else if showInstallButton}
		<Button
			aria-label="Download"
			onclick={() => {
				// @ts-expect-error Not standard API yet, so need this ignore
				deferredPrompt.prompt();
				deferredPrompt = null;
			}}
			size="icon"
			variant="ghost"
		>
			<DownloadIcon />
		</Button>
	{/if}
{:else}
	<div class="grow">
		{#if $needRefresh}
			<Button
				class="w-full gap-2 text-base"
				disabled={reloading}
				onclick={updateApplication}
				size="lg"
				variant="outline"
			>
				<UpdateIcon class={cn({ 'animate-spin': reloading })} />
				Reload
			</Button>
		{:else if showInstallButton}
			<Button
				class="w-full gap-2 text-base"
				aria-label="Download"
				onclick={() => {
					// @ts-expect-error Not standard API yet, so need this ignore
					deferredPrompt.prompt();
					deferredPrompt = null;
				}}
				size="lg"
				variant="outline"
			>
				<DownloadIcon /> Download
			</Button>
		{/if}
	</div>
{/if}
