<script lang="ts">
	import { browser } from '$app/environment';
	import '$lib/capacitor-fetch-patch';
	import { Toaster } from '$lib/components/ui/sonner';
	import { oklchToHex } from '$lib/my-utils';
	import { StatusBar, Style } from '@capacitor/status-bar';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { mode, ModeWatcher } from 'mode-watcher';
	import { pwaInfo } from 'virtual:pwa-info';
	import '../app.css';
	import SwEventsHandler from './_components/sw-events-handler.svelte';

	let { children } = $props();
	const queryClient = new QueryClient({
		defaultOptions: { queries: { enabled: browser } }
	});

	$effect(() => {
		if (!mode.current) return;
		requestAnimationFrame(() => {
			const computedStyle = getComputedStyle(document.documentElement);
			const backgroundColor = computedStyle.getPropertyValue('--background').trim();
			const hexColor = oklchToHex(backgroundColor);

			StatusBar.setBackgroundColor({ color: hexColor });
			StatusBar.setStyle({ style: mode.current === 'dark' ? Style.Dark : Style.Light });
		});
	});

	const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifestLink}
</svelte:head>

<ModeWatcher />
<Toaster />
<SwEventsHandler />

<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
