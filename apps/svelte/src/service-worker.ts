/// <reference lib="WebWorker" />
import { setCacheNameDetails } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

setCacheNameDetails({
	prefix: '',
	suffix: '',
	precache: 'workbox-precache',
	runtime: 'workbox-runtime'
});
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST, {
	ignoreURLParametersMatching: [/.*/],
	cleanURLs: true
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

registerRoute(
	({ request }) => request.destination === 'image',
	new CacheFirst({ cacheName: 'workbox-runtime' })
);
