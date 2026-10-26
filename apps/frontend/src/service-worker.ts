/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { build, files, prerendered, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

/** Versioned, so each deploy gets its own cache and the previous one is deleted on activate. */
const CACHE = `myfit-${version}`;

/** Every route without its own prerendered page boots from this, like the host's SPA fallback. */
const SHELL = '/index.html';

/** The app shell, prerendered pages, hashed JS/CSS and static files such as fonts. */
const PRECACHE = [SHELL, ...prerendered, ...build, ...files.filter((f) => f !== '/robots.txt')];

sw.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

// A new worker waits until every tab on the old one closes, so a running tab never mixes
// chunks from two builds. The single-tab lock makes that wait short.
sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
			)
	);
});

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);
	// The API, PostHog and anything else cross-origin always goes to the network: sync and
	// auth must see real failures, never a cached answer.
	if (request.method !== 'GET' || url.origin !== sw.location.origin) return;
	event.respondWith(respond(request, url));
});

/**
 * Serves precached files straight from the cache, and any other page navigation as the shell,
 * which the client router takes over. Both match the build that cached them, so a tab never
 * pairs an old shell with new chunks. Everything else, such as `_app/version.json`, goes to
 * the network.
 */
async function respond(request: Request, url: URL): Promise<Response> {
	const cache = await caches.open(CACHE);
	const cached = await cache.match(url.pathname);
	if (cached) return cached;
	if (request.mode === 'navigate') return (await cache.match(SHELL)) ?? fetch(request);
	return fetch(request);
}
