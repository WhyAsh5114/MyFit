# Local-first data

MyFit is a local-first, mobile-first single-page app built with SvelteKit and Capacitor. A user logs food on a phone, often offline, in short bursts, so every read and write of their own data happens on the device and the server catches up in the background.

## The app has no server rendering

The root layout sets `prerender = true` and the `(app)` group sets `ssr = false`. The static adapter builds a shell that Capacitor bundles into the native apps and the web serves as is. All data is fetched in the browser.

## User data lives in IndexedDB

All user data (food entries, metrics, targets, preferences, chats) is stored in IndexedDB through the Prisma IDB client (`@prisma-idb/client-idb`). Its types come from the shared schema in `packages/shared`, which the server also uses for PostgreSQL.

A write goes to IndexedDB first, so it is instant and works offline. The sync extension records each `orm.*` write in an outbox, and the sync worker pushes the outbox to the server in the background and pulls other devices' changes. The user never waits for the network to save.

## Remote data is read-only

Nutrition data (the Open Food Facts table) is too large to store on a phone, so the app fetches it from the Hono API and caches it in TanStack Query. The app never writes it locally.

So the app has two clients, one per kind of data:

- `getDb()` (`#lib/clients/idb-client`) returns the IndexedDB client (`DbClient`). All user data goes through `const { orm } = await getDb()`.
- `apiClient` is the Hono RPC client, used for nutrition search and lookup, chat and uploads.

## Routes load local data

Each page's `load` reads IndexedDB and returns the data, so the page renders whole instead of through skeletons. SvelteKit keeps the current page on screen until the next `load` settles, so a day change or a navigation never flashes a loading state.

When data changes (a mutation, or a sync pull), the code reruns every `load` that read it, using the query keys it registered. That replaces TanStack's cache invalidation for local data. TanStack stays for remote and device reads, because a `load` that waited on the network would hold up the navigation.

The rules for writing readers, loads and mutations are in [Data layer](../reference/data-layer.md).
