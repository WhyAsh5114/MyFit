/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="WebWorker" />

declare let self: ServiceWorkerGlobalScope;
import { build, files, version } from '$service-worker';
import { precacheAndRoute } from 'workbox-precaching';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files // everything in `static`
];

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;
	// ignore chrome-extensions requests (all non http requests)
	if (!event.request.url.startsWith('http')) return;
	// ignore auth requests (doesn't make sense to cache them)
	if (event.request.url.includes('/auth/')) return;

	async function respond(): Promise<Response> {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		if (ASSETS.includes(url.pathname)) {
			// Should always be able to find these assets
			const match = (await cache.match(url.pathname)) as Response;
			return match;
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);

			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch {
			const match = await cache.match(url.pathname);
			if (!match) {
				return new Response('Not found', { status: 404 });
			}
			return match;
		}
	}

	event.respondWith(respond());
});
