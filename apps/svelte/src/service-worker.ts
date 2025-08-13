/// <reference lib="WebWorker" />
import { deleteDB } from 'idb';
import { setCacheNameDetails } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

setCacheNameDetails({
	prefix: '',
	precache: 'workbox-precache',
	suffix: ''
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

async function clearIndexedDB() {
	try {
		const databaseNames = ['prisma-idb'];
		await Promise.all(databaseNames.map((dbName) => deleteDB(dbName)));
	} catch (error) {
		console.error('Error clearing IndexedDB:', error);
	}
}

self.addEventListener('activate', (event) => {
	clearIndexedDB();
});
