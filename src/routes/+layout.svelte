<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import '../app.pcss';
	import ChangelogDialog from './(components)/layout/ChangelogDialog.svelte';
	import DesktopLayout from './(components)/layout/DesktopLayout.svelte';
	import MobileLayout from './(components)/layout/MobileLayout.svelte';
	import UpdateDataLossDialog from './(components)/layout/UpdateDataLossDialog.svelte';

	import { overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action';
	overrideItemIdKeyNameBeforeInitialisingDndZones('name');

	const { children } = $props();
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
	<!-- eslint-disable -->
	{@html webManifestLink}
</svelte:head>

<ModeWatcher />
<Toaster />

<ChangelogDialog />
<UpdateDataLossDialog />

{#if isMobile === true}
	<MobileLayout>{@render children()}</MobileLayout>
{:else if isMobile === false}
	<DesktopLayout>{@render children()}</DesktopLayout>
{/if}
