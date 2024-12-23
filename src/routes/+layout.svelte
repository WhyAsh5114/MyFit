<script lang="ts">
	import '../app.pcss';
	import { pwaInfo } from 'virtual:pwa-info';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import MobileLayout from './(components)/layout/MobileLayout.svelte';
	import DesktopLayout from './(components)/layout/DesktopLayout.svelte';
	import { onMount } from 'svelte';

	import { overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action';
	import ChangelogDialog from './(components)/layout/ChangelogDialog.svelte';
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

{#if isMobile === true}
	<MobileLayout>{@render children()}</MobileLayout>
{:else if isMobile === false}
	<DesktopLayout>{@render children()}</DesktopLayout>
{/if}
