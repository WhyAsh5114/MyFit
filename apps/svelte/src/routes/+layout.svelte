<script lang="ts">
	import { browser } from '$app/environment';
	import { Toaster } from '$lib/components/ui/sonner';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import SwEventsHandler from './_components/sw-events-handler.svelte';
	import { ModeWatcher, setMode } from 'mode-watcher';
	import { pwaInfo } from 'virtual:pwa-info';
	import '../app.css';

	let { children } = $props();
	const queryClient = new QueryClient({
		defaultOptions: { queries: { enabled: browser } }
	});

	function themeChangeHandler(event: Event) {
		if ('data' in event && typeof event.data === 'string') {
			const eventData: { eventType: string; payload: string } = JSON.parse(event.data);
			if (eventData.eventType === 'THEME_CHANGE') {
				const { payload } = eventData;
				setMode(payload === 'dark' ? 'dark' : 'light');
			}
		}
	}

	$effect(() => {
		window.addEventListener('message', themeChangeHandler);
		document.addEventListener('message', themeChangeHandler);
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
