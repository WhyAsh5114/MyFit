<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.webp';
	import { mode, ModeWatcher } from 'mode-watcher';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
	import { App } from '@capacitor/app';
	import { queryClient } from '$lib/clients/query-client';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import ResponsiveDialog from '$lib/components/responsive-dialog.svelte';
	import StateBackdrop from '$lib/components/state-backdrop.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { initOta } from '$lib/services/ota';
	import { accountSession, claimTab } from '$lib/features/account-session.svelte';
	import { m } from '$lib/paraglide/messages';

	let { children } = $props();

	// Claimed here rather than in the app layout so the login page cannot change the shared
	// session under the tab that owns the local database.
	$effect(() => {
		claimTab();
	});

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
<Toaster />

<QueryClientProvider client={queryClient}>
	<SvelteQueryDevtools buttonPosition="top-right" />
	{#if accountSession.tab === 'blocked'}
		<StateBackdrop scene="forest" />
		<ResponsiveDialog
			title={m['account.openElsewhereTitle']()}
			description={m['account.openElsewhere']()}
			dismissible={false}
		/>
	{:else}
		{@render children()}
	{/if}
</QueryClientProvider>

<div style="display:none">
	{#each locales as locale (locale)}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={localizeHref(page.url.pathname, { locale })}>
			{locale}
		</a>
	{/each}
</div>
