import type { HandleClientError } from '@sveltejs/kit/hooks';
import { Capacitor } from '@capacitor/core';
import { dev } from '$app/env';
import { registerServiceWorker } from '#lib/features/service-worker.svelte.js';
import posthog from 'posthog-js';
import { mount } from 'svelte';
import AccountRoot from '#lib/components/account/account-root.svelte';
import { claimTab } from '#lib/features/account-session.svelte.js';
import { startNative } from '#lib/services/native.svelte.js';
import './routes/layout.css';
import { PUBLIC_POSTHOG_KEY, PUBLIC_POSTHOG_HOST } from '$app/env/public';

export async function init() {
	// Before the first `load`, which waits for the account. The tab lock and the account's dialogs
	// can't live in the router's tree, because it renders only once those loads have finished.
	claimTab();
	mount(AccountRoot, { target: document.body });
	startNative();

	posthog.init(PUBLIC_POSTHOG_KEY, {
		api_host: 'https://t.myfit.fit',
		ui_host: PUBLIC_POSTHOG_HOST,
		defaults: '2026-01-30',
		capture_exceptions: true
	});

	// The native apps bundle their files, so only the web build needs the worker to work offline.
	if (!dev && 'serviceWorker' in navigator && !Capacitor.isNativePlatform()) {
		await registerServiceWorker();
	}
}

export const handleError: HandleClientError = ({ kind, error }) => {
	// App and framework errors such as a 404 are expected; only unknown errors are bugs.
	if (kind === 'unknown') posthog.captureException(error);
};
