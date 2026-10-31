<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '#lib/paraglide/runtime.js';
	import './layout.css';
	import favicon from '#lib/assets/favicon.webp';
	import { mode, ModeWatcher } from 'mode-watcher';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
	import { App } from '@capacitor/app';
	import { queryClient } from '#lib/clients/query-client.js';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import { initOta } from '#lib/services/ota.js';

	let { children } = $props();

	$effect(() => {
		if (Capacitor.getPlatform() !== 'android') return;
		App.addListener('backButton', ({ canGoBack }) => {
			if (canGoBack) window.history.back();
			else App.exitApp();
		});
	});

	// The in-app theme can differ from the device's, so set the system bar icons to match it.
	$effect(() => {
		if (!Capacitor.isNativePlatform() || !mode.current) return;
		SystemBars.setStyle({
			style: mode.current === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light
		});
	});

	// Initialize OTA updates on mount (native only — no-op on web)
	$effect(() => {
		initOta();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>MyFit</title>
	<meta name="description" content="Super comprehensive science-based fitness platform" />
</svelte:head>

<ModeWatcher />

<QueryClientProvider client={queryClient}>
	<SvelteQueryDevtools buttonPosition="top-right" />
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
