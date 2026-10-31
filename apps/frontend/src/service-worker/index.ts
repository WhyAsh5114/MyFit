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
	// A new worker waits after it installs, so a page keeps the build it started with. The client
	// asks it to take over (the message below) once the user accepts the update.
	skipWaiting: false,
	clientsClaim: true
});

serwist.registerRoute(new NavigationRoute(serwist.createHandlerBoundToUrl(SHELL)));
serwist.addEventListeners();

// The client sends this when the user accepts an update.
sw.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') void sw.skipWaiting();
});
