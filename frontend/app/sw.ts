import {
  CacheFirst,
  PrecacheEntry,
  Serwist,
  SerwistGlobalConfig,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false,
  clientsClaim: true,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    ignoreURLParametersMatching: [/.*/],
    cleanURLs: true,
    cacheName: "serwist-precache",
  },
  runtimeCaching: [
    {
      matcher: ({ request }) => request.destination === "image",
      handler: new CacheFirst({ cacheName: "pwa-runtime-images" }),
    },
  ],
});

self.addEventListener("message", async (event) => {
  const skipWaitAndClaimClients = async () => {
    await self.skipWaiting();
    await self.clients.claim();
  };
  if (event.data.type === "SKIP_WAITING") {
    event.waitUntil(skipWaitAndClaimClients());
  }
});

serwist.addEventListeners();
