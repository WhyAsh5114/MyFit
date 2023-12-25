/// <reference lib="WebWorker" />
import {
  PrecacheFallbackPlugin,
  precacheAndRoute,
  cleanupOutdatedCaches
} from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
declare let self: ServiceWorkerGlobalScope;

const cacheFirstDestinations = ["styles", "css", "html"];
const strategyOptions = {
  plugins: [
    new PrecacheFallbackPlugin({
      fallbackURL: "/offline"
    })
  ]
};

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

// Network first for everything except static assets
registerRoute(
  ({ request, url }) =>
    !cacheFirstDestinations.includes(request.destination) && !url.pathname.startsWith("/auth"),
  new NetworkFirst(strategyOptions)
);

// Cache first for images, css
registerRoute(
  ({ request, url }) =>
    cacheFirstDestinations.includes(request.destination) && !url.pathname.startsWith("/auth"),
  new CacheFirst(strategyOptions)
);
