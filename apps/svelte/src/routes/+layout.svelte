<script lang="ts">
	import { browser } from '$app/environment';
	import { Toaster } from '$lib/components/ui/sonner';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { ModeWatcher, setMode } from 'mode-watcher';
	import '../app.css';

	let { children } = $props();
	const queryClient = new QueryClient({ defaultOptions: { queries: { enabled: browser } } });

	function themeChangeHandler(event: Event) {
		if ('data' in event && typeof event.data === 'string') {
			const eventData: { eventType: string; payload: string } = JSON.parse(event.data);
			if (eventData.eventType === 'THEME_CHANGE') {
				const { payload } = eventData;
				if (payload === 'dark') {
					setMode('dark');
				} else {
					setMode('light');
				}
			}
		}
	}

	$effect(() => {
		window.addEventListener('message', themeChangeHandler);
		document.addEventListener('message', themeChangeHandler);
	});
</script>

<svelte:head>
	<title>MyFit</title>
	<link rel="manifest" href="/manifest.json" />
	<meta name="application-name" content="MyFit" />
	<meta name="description" content="Most comprehensive fitness platform ever!" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<ModeWatcher />
<Toaster />

<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
