import { Capacitor } from '@capacitor/core';
import { dev } from '$app/environment';
import { registerServiceWorker } from '$lib/features/service-worker';
import posthog from 'posthog-js';
import { PUBLIC_POSTHOG_KEY, PUBLIC_POSTHOG_HOST } from '$env/static/public';
import type { HandleClientError } from '@sveltejs/kit';

export async function init() {
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

export const handleError: HandleClientError = async ({ error, status, message }) => {
	posthog.captureException(error);
	return { message, status };
};
