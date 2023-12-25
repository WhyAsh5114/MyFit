/// <reference lib="WebWorker" />
import {
  PrecacheFallbackPlugin,
  precacheAndRoute,
  cleanupOutdatedCaches
} from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
declare let self: ServiceWorkerGlobalScope;

const cacheFirstDestinations: RequestDestination[] = ["style", "manifest", "image"];
const strategyOptions = {
  plugins: [
    new PrecacheFallbackPlugin({
      fallbackURL: "/offline"
    })
  ]
};

function routingStrategyFunction(mode: "networkFirst" | "cacheFirst", request: Request, url: URL) {
  // Ignore /auth requests
  if (url.pathname.startsWith("/auth")) return false;
  // Decide whether or not asset should be cached (cacheFirstDestinations, and unplugin-icons)
  let toCache = false;
  if (cacheFirstDestinations.includes(request.destination) || url.pathname.includes("~icons")) {
    toCache = true;
  }
  // If function used in cacheFirst strategy, return toCache value
  // otherwise being used in networkFirst, which is naturally the assets which shouldn't be cached
  return mode === "cacheFirst" ? toCache : !toCache;
}

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

// Network first for everything except static assets
registerRoute(
  ({ request, url }) => routingStrategyFunction("networkFirst", request, url),
  new NetworkFirst(strategyOptions)
);

// Cache first for images, css
registerRoute(
  ({ request, url }) => routingStrategyFunction("cacheFirst", request, url),
  new CacheFirst(strategyOptions)
);
