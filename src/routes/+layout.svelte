<script lang="ts">
	import '../app.pcss';
	import { pwaInfo } from 'virtual:pwa-info';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import MobileLayout from './(components)/MobileLayout.svelte';
	import DesktopLayout from './(components)/DesktopLayout.svelte';
	import { onMount } from 'svelte';

	const { children } = $props()
	const webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';
	let isMobile: undefined | boolean = $state(undefined);

	onMount(() => {
		isMobile = window.innerWidth < 1024;
		window.addEventListener('resize', () => {
			isMobile = window.innerWidth < 1024;
		});
	});
</script>

<svelte:head>
	{@html webManifestLink}
</svelte:head>

<ModeWatcher />
<Toaster />
{#if isMobile === true}
	<MobileLayout>{@render children()}</MobileLayout>
{:else if isMobile === false}
	<DesktopLayout>{@render children()}</DesktopLayout>
{/if}
