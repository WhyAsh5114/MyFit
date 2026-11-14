# Updates and version drift

Three things can be out of step: the web app, the installed native binary, and the server. Each has its own update path, and the sync contract is what keeps their data compatible.

| Surface         | How it updates                                          | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Web             | Service worker (`src/service-worker/index.ts`, Serwist) | A new worker installs and waits (`skipWaiting` is off), so an open page keeps its build until the user accepts: the "update" toast, or Settings → App updates, which can also check on demand. Accepting messages `SKIP_WAITING` and reloads under the new worker (`clientsClaim` makes it take over). It checks hourly and on tab focus. Registered in `hooks.client.ts` through `lib/services/service-worker.svelte.ts`, which holds the update state the Settings card reads. Web only: WKWebView does not run it for the app's local origin. |
| iOS and Android | Store release, or OTA for web-only changes              | Store releases are only for native changes (plugins, native config, Capacitor upgrades). Everything else ships as an OTA bundle.                                                                                                                                                                                                                                                                                                                                                                                                                 |

## OTA channels

A bundle ships its own Capacitor JS, which must match the native bridge in the installed app. So bundles are published to a channel named for the Capacitor core major (`cap8`), computed in `apps/frontend/scripts/ota-channel.js` and embedded at build time as `__OTA_CHANNEL__`. The app asks `GET /api/ota/latest?channel=…`, and the API serves each channel only its newest upload.

Upgrading Capacitor starts a new channel by itself. For another change that old apps can't run, change `otaChannel()` to return a new name such as `cap8-2`. There is no native version comparison and no `minNativeVersion`.

There is no rollback endpoint: to withdraw a bad release, upload the last good build as a new version (see [Release the app](../how-to/release.md)). Capgo rolls back by itself when a bundle never calls `notifyAppReady`, which the app calls only after it has read the local database. A rollback does not undo IndexedDB migrations a newer bundle already ran, so don't rely on one across a schema change.

## The sync contract

The sync worker sends a hash of the client contract (`storageHash`) with every push and pull, and the server accepts exactly one. A mismatch returns 409: the worker stops, keeps the outbox and cursor, and emits `contractmismatch`.

- Web recovers when the new service worker takes over and the user reloads. Native recovers when the next OTA bundle applies, or when the store update lands for a native-incompatible change.
- Treat any client-visible schema change as breaking for older clients, even an additive one.
- Server-only changes (indexes, `@@idb.exclude` models) should not change the contract hash.
- The server can't serve two contracts at once, so a client-visible schema change always leaves a window in which clients on the other contract can't sync. Their edits stay queued. Keep the window short: batch such changes, publish the new client, then deploy the matching server change right after.
