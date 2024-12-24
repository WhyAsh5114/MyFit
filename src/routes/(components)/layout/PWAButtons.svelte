<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';
	import DownloadIcon from 'virtual:icons/lucide/download';
	import UpdateIcon from 'virtual:icons/lucide/refresh-cw';
	import { needRefresh, updateDataLossDialog } from './PWAFunctions.svelte';

	let { isMobile }: { isMobile: boolean } = $props();

	let deferredPrompt: Event | null;
	let reloading = $state(false);
	let showInstallButton = $state(false);

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
	});

	function updateApplication() {
		updateDataLossDialog.open = true;
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
