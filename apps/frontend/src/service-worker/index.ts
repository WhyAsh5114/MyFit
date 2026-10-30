import { self as sw } from '$app/service-worker';
import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { resolve } from '$app/paths';
import { NavigationRoute, Serwist, type PrecacheEntry } from 'serwist';

/** Manifest paths are relative to the base path, which `resolve('/')` ends with a slash. */
const BASE = resolve('/');
const absolute = (path: string) => `${BASE}${path}`;

/** Every route without its own prerendered page boots from this, like the host's SPA fallback. */
const SHELL = absolute('index.html');

/** Hashed build files never change under the same name, so they need no revision. */
const hashed = immutable.map(({ path }): PrecacheEntry => ({
	url: absolute(path),
	revision: null
}));

/** The app shell, prerendered pages and static files such as fonts change per deploy. */
const unhashed = [
	SHELL,
	...prerendered.map(({ path }) => absolute(path)),
	...assets.filter(({ path }) => path !== 'robots.txt').map(({ path }) => absolute(path))
].map((url): PrecacheEntry => ({ url, revision: version }));

// The API, PostHog and anything else cross-origin always goes to the network: sync and auth
// must see real failures, never a cached answer. Only the precached same-origin files and the
// navigation fallback below are answered by the worker.
const serwist = new Serwist({
	precacheEntries: [...hashed, ...unhashed],
	// A new worker takes over as soon as it installs, so a deploy reaches open tabs without
	// waiting for every tab to close. The client offers a reload when this happens.
	skipWaiting: true,
	clientsClaim: true
});

serwist.registerRoute(new NavigationRoute(serwist.createHandlerBoundToUrl(SHELL)));
serwist.addEventListeners();

// Kept for safety against the worker being replaced mid-install by an older build.
sw.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') void sw.skipWaiting();
});
