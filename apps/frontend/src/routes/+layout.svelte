<script lang="ts">
	import { building } from '$app/env';
	import { page } from '$app/state';
	import { locales, localizeHref } from '#lib/paraglide/runtime.js';
	import './layout.css';
	import favicon from '#lib/assets/favicon.webp';
	import { ModeWatcher } from 'mode-watcher';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { queryClient } from '#lib/clients/query-client.js';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>MyFit</title>
	<meta name="description" content="Super comprehensive science-based fitness platform" />
</svelte:head>

<!-- Only the prerendered page needs this: it carries the script that sets the theme before first
paint. The account root mounts the watcher the running app uses, from `init`. -->
{#if building}
	<ModeWatcher />
{/if}

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
