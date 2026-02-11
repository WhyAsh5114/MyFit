<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.webp';
	import { ModeWatcher } from 'mode-watcher';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { Capacitor } from '@capacitor/core';
	import { App } from '@capacitor/app';
	import { queryClient } from '$lib/query-client';
	import { Toaster } from "$lib/components/ui/sonner/index.js";

	let { children } = $props();

	$effect(() => {
		if (Capacitor.getPlatform() !== 'android') return;
		App.addListener('backButton', ({ canGoBack }) => {
			if (canGoBack) window.history.back();
			else App.exitApp();
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>MyFit</title>
	<meta name="description" content="Super comprehensive science-based fitness platform" />
</svelte:head>

<ModeWatcher />
<Toaster />

<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>

<div style="display:none">
	{#each locales as locale (locale)}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={localizeHref(page.url.pathname, { locale })}>
			{locale}
		</a>
	{/each}
</div>
