/// <reference lib="WebWorker" />
import {
	PrecacheFallbackPlugin,
	precacheAndRoute,
	cleanupOutdatedCaches
} from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, NetworkOnly } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
declare let self: ServiceWorkerGlobalScope;

const cacheFirstDestinations: RequestDestination[] = ['style', 'manifest', 'image'];
const fallbackPlugin = new PrecacheFallbackPlugin({ fallbackURL: '/offline' });
const backgroundSyncPlugin = new BackgroundSyncPlugin('pendingRequests');

function routingStrategyFunction(mode: 'networkFirst' | 'cacheFirst', request: Request, url: URL) {
	// Ignore POST API endpoints (should be network only)
	if (url.pathname.startsWith('/api') && request.method === 'POST') return false;
	// Ignore /auth requests
	if (url.pathname.startsWith('/auth')) return false;
	// Decide whether or not asset should be cached (cacheFirstDestinations, and unplugin-icons)
	let toCache = false;
	if (cacheFirstDestinations.includes(request.destination) || url.pathname.includes('~icons')) {
		toCache = true;
	}
	// If function used in cacheFirst strategy, return toCache value
	// otherwise being used in networkFirst, which is naturally the assets which shouldn't be cached
	return mode === 'cacheFirst' ? toCache : !toCache;
}

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST, { ignoreURLParametersMatching: [/callbackURL/] });

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

registerRoute(
	({ url }) => url.pathname.startsWith('/api'),
	new NetworkOnly({
		plugins: [backgroundSyncPlugin],
		networkTimeoutSeconds: 5
	}),
	'POST'
);

// Network first for everything except static assets, /auth, and /api
registerRoute(
	({ request, url }) => routingStrategyFunction('networkFirst', request, url),
	new NetworkFirst({ plugins: [fallbackPlugin], networkTimeoutSeconds: 5 })
);

// Cache first for images, css
registerRoute(
	({ request, url }) => routingStrategyFunction('cacheFirst', request, url),
	new CacheFirst({ plugins: [fallbackPlugin] })
);
