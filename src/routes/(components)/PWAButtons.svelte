<script lang="ts">
	import { onMount } from 'svelte';
	import { useRegisterSW } from 'virtual:pwa-register/svelte';
	import type { Writable } from 'svelte/store';
	import DownloadIcon from 'virtual:icons/lucide/download';
	import UpdateIcon from 'virtual:icons/lucide/refresh-cw';
	import Button from '$lib/components/ui/button/button.svelte';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';

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
					}, 20000);	// TODO: increase a lot in production
				console.log(`SW Registered: ${r}`);
			},
			onRegisterError(error) {
				console.log('SW registration error', error);
			}
		}));
	});
</script>

{#if isMobile}
	{#if $needRefresh}
		<Button
			variant="ghost"
			size="icon"
			onclick={() => {
				updateServiceWorker(true);
				reloading = true;
			}}
		>
			{#if !reloading}
				<UpdateIcon />
			{:else}
				<LoaderCircle class="animate-spin" />
			{/if}
		</Button>
	{:else if showInstallButton}
		<Button
			variant="ghost"
			size="icon"
			aria-label="Download"
			onclick={() => {
				// @ts-expect-error Not standard API yet, so need this ignore
				deferredPrompt.prompt();
				deferredPrompt = null;
			}}
		>
			<DownloadIcon />
		</Button>
	{/if}
{:else}
	<div class="grow">
		{#if $needRefresh}
			<Button
				variant="outline"
				class="w-full gap-2 text-base"
				size="lg"
				disabled={reloading}
				onclick={() => {
					updateServiceWorker(true);
					reloading = true;
				}}
			>
				{#if !reloading}
					<UpdateIcon />
				{:else}
					<LoaderCircle class="animate-spin" />
				{/if}
				Reload
			</Button>
		{:else if showInstallButton}
			<Button
				variant="outline"
				class="w-full gap-2 text-base"
				size="lg"
				aria-label="Download"
				onclick={() => {
					// @ts-expect-error Not standard API yet, so need this ignore
					deferredPrompt.prompt();
					deferredPrompt = null;
				}}
			>
				<DownloadIcon /> Download
			</Button>
		{/if}
	</div>
{/if}
