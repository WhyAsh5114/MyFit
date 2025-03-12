/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { CacheFirst, Serwist } from 'serwist';

declare global {
	interface WorkerGlobalScope extends SerwistGlobalConfig {
		__SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
	}
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	precacheOptions: {
		cleanupOutdatedCaches: true,
		concurrency: 20,
		ignoreURLParametersMatching: [/^x-sveltekit-invalidated$/],
		cleanURLs: true,
		cacheName: 'serwist-precache'
	},
	skipWaiting: false,
	clientsClaim: true,
	navigationPreload: false,
	disableDevLogs: true,
	runtimeCaching: [
		{
			matcher: ({ request }) => request.destination === 'image',
			handler: new CacheFirst({ cacheName: 'pwa-runtime-images' })
		}
	]
});

self.addEventListener('message', async (event) => {
	const skipWaitAndClaimClients = async () => {
		await self.skipWaiting();
		await self.clients.claim();
	};
	if (event.data.type === 'SKIP_WAITING') {
		event.waitUntil(skipWaitAndClaimClients());
	}
});

serwist.addEventListeners();
