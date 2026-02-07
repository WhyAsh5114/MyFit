<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.webp';
	import { mode, ModeWatcher } from 'mode-watcher';
	import { Capacitor } from '@capacitor/core';
	import { StatusBar, Style } from '@capacitor/status-bar';
	import { oklchToHex } from '$lib/my-utils';

	let { children } = $props();

	$effect(() => {
		if (!mode.current) return;
		if (!Capacitor.isNativePlatform()) return;
		requestAnimationFrame(() => {
			const computedStyle = getComputedStyle(document.documentElement);
			const backgroundColor = computedStyle.getPropertyValue('--background').trim();
			const hexColor = oklchToHex(backgroundColor);

			StatusBar.setBackgroundColor({ color: hexColor });
			StatusBar.setStyle({ style: mode.current === 'dark' ? Style.Dark : Style.Light });
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>MyFit</title>
	<meta name="description" content="Super comprehensive science-based fitness platform" />
</svelte:head>

<ModeWatcher />

{@render children()}

<div style="display:none">
	{#each locales as locale (locale)}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={localizeHref(page.url.pathname, { locale })}>
			{locale}
		</a>
	{/each}
</div>
