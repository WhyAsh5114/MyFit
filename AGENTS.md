# MyFit v4 contributor guide

## Workspace and setup

MyFit is a local-first fitness app in a pnpm/Turborepo workspace. Use Node 24 or later
and the pnpm version pinned in the root `package.json`. Install with
`pnpm install --frozen-lockfile`. The API also needs Bun.

| Path              | Package           | Responsibility                                                               |
| ----------------- | ----------------- | ---------------------------------------------------------------------------- |
| `apps/frontend`   | `@myfit/frontend` | SvelteKit 3, Svelte 5, static web app and Capacitor iOS/Android app          |
| `apps/api`        | `@myfit/api`      | Hono API, Better Auth, nutrition search, sync and OTA endpoints; runs on Bun |
| `packages/shared` | `@myfit/shared`   | Prisma schema, browser/server contracts, migrations and shared types         |

Copy each app's `.env.example` to its `.env` for local development. Run `pnpm dev`
for both apps, or `pnpm --filter @myfit/frontend dev` / `pnpm --filter @myfit/api dev`
for one. See the [root README](README.md) and each app's README for setup.

## Versioning and releases

- **Do not add Changesets.** This branch has no `.changeset` directory, Changesets
  dependency, version script or package-publishing workflow. MyFit consumes
  prisma-idb; that dependency's contribution and release rules do not apply here.
- Native releases use `apps/frontend/package.json`'s `version`, bumped by hand in
  the release commit. Web-only changes need no version bump. Android reads the
  version directly; iOS archive arguments come from `scripts/native-version.js`.
  Follow [Frontend releases](apps/frontend/README.md#releases).
- `.github/workflows/frontend.yml` builds and tests relevant pushes. On `main`
  and `v4-turborepo`, it uploads the built web bundle to the API after unit and
  end-to-end tests pass. Other branches build and test without uploading OTA.
- OTA channels come from `apps/frontend/scripts/ota-channel.js` and follow the
  Capacitor core major. Native plugin/config changes need a store release.
  Keep native capabilities optional: check `Capacitor.isPluginAvailable` and
  handle methods missing from older binaries.
- Web updates use the service worker in `apps/frontend/src/service-worker` and
  wait for user acceptance. To replace a bad OTA bundle, upload a rebuilt good
  commit in the same channel. A rollback does not undo IndexedDB migrations.
- The API workflow checks, tests and builds; it does not deploy. Container setup
  is in `docker-compose.yml` and `apps/api/Dockerfile`. The API's `entrypoint.sh`
  applies migrations and seeds an empty nutrition table before starting Bun.
  No production deployment command is defined in the workflows.

## Checks

Run commands from the repository root. Scope checks to the changed package and
run the affected tests, typecheck and lint for code changes. Each package's
`lint` includes Prettier and ESLint. Root scripts run tasks across the workspace.

| Scope    | Tests                                  | Typecheck                                  | Lint                                 |
| -------- | -------------------------------------- | ------------------------------------------ | ------------------------------------ |
| Frontend | `pnpm --filter @myfit/frontend test`   | `pnpm --filter @myfit/frontend check`      | `pnpm --filter @myfit/frontend lint` |
| API      | `pnpm --filter @myfit/api test`        | `pnpm turbo run check --filter=@myfit/api` | `pnpm --filter @myfit/api lint`      |
| Shared   | No test script; run affected app tests | `pnpm --filter @myfit/shared check`        | `pnpm --filter @myfit/shared lint`   |

- To select a Vitest file, append its package-relative path:
  `pnpm --filter @myfit/frontend test tests/lib/data/dependencies.test.ts`.
- API integration tests need PostgreSQL 16. Set `TEST_DATABASE_URL`, then run
  `DATABASE_URL="$TEST_DATABASE_URL" pnpm --filter @myfit/shared db:migrate` before
  testing. Some API suites need no database; see [API testing](apps/api/docs/testing.md).
- For frontend end-to-end tests, migrate the test database, install Chromium
  with `pnpm --filter @myfit/frontend exec playwright install chromium`, then run
  `pnpm --filter @myfit/frontend test:e2e` (optionally followed by a spec path).
  Playwright starts the mail stub, Bun API and built app. See
  [Frontend testing](apps/frontend/README.md#testing).
- Before frontend checks outside Vite, generate translations as CI does:
  `pnpm --filter @myfit/frontend exec paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide`.
- Build the affected app with `pnpm --filter @myfit/frontend build` or
  `pnpm --filter @myfit/api build`. Frontend builds need the `PUBLIC_*` values
  shown in `.env.example` or the frontend workflow.
- For Markdown-only changes, check the edited files with
  `pnpm exec prettier --check <file>` and `git diff --check`. The app workflows
  use path filters and do not run for root Markdown-only changes.

## Architecture and code conventions

In this section, `src/` paths are relative to `apps/frontend`.

- Read [DESIGN.md](DESIGN.md) before changing UI. Use existing components under
  `apps/frontend/src/lib/components/ui`, Svelte 5 runes and the `#lib/*` imports
  defined in the frontend package. Prefer `$derived` for computed values.
- The frontend uses a static adapter. The `(app)` route group disables SSR;
  IndexedDB is browser-only. Await `getDb()` from `#lib/clients/idb-client.js`
  inside readers and mutations. It opens and migrates the shared client lazily;
  `orm.*` writes also enter the sync outbox.
- Features live under `src/lib/features/{domain}/{resource}` with `keys.ts`,
  `queries/`, `mutations/` and a schema. Use `model/` for complex schemas and
  mappers only when form and database shapes differ. Pure nutrition calculations
  live under `src/lib/domain` without framework, client or feature dependencies.
- Local reads use `defineReader({ keys, read })` from `src/lib/data/dependencies.ts`.
  Route `load` functions call those readers with `depends`; ESLint rejects direct
  IDB imports in route loaders and unregistered local readers. Keep user IDs in
  dependency keys. Read page data through `$derived`, so invalidation updates it.
- Local writes use `useMutation` from `src/lib/data/mutation.svelte.ts`.
  Return `invalidateKeys(...)` from `onSuccess`, so callers wait for fresh page
  data. Sync pulls invalidate the same keys through `services/sync/sync-invalidation.ts`.
  Use local calendar days for diary keys, rather than UTC dates.
- TanStack Query handles remote nutrition and device reads. Accept reactive
  getters for query arguments. Let `queryFn` errors propagate; retries must not
  repeat toasts. Keep remote query definitions in feature modules.
- Forms use Superforms with `SPA: true` and Zod 4. Keep the schema and inferred
  type together. Production UI strings use Paraglide keys in both
  `apps/frontend/messages/en.json` and `hi.json`.
- Account coordination lives in `src/lib/services/account` and the account root
  mounted by `hooks.client.ts` before route loads. Keep it outside the router so
  account dialogs can resolve loads waiting on `accountReady`. Protected routes
  get `ownerId` from `await parent()`. Preserve queued edits during account
  switching and logout; an expired session must still allow offline work.
- Chat tools execute on the device in `src/routes/(app)/(protected)/chat/components/chat.svelte.ts`.
  The server declares tools and receives their results. Send the user's local
  date with requests, since the server can be on another day.

## Schema and sync changes

Edit `packages/shared/src/schema.prisma`, then run
`pnpm --filter @myfit/shared schema:sync <migration-name>`. Commit all resulting
contracts and migrations. This command emits both contracts, plans both migration
chains, preflights IndexedDB and formats generated files. Follow the
[root database guide](README.md) for destructive changes or manual migrations.

Sync uses `rootModel: 'User'` in `apps/api/src/features/sync/routes.ts`. Give new
user-scoped models a relation path to `User`; mark server-only models with
`@@idb.exclude`. The server accepts one client storage hash and returns HTTP 409
on mismatch, leaving edits queued. Coordinate client and server deployment for
client-visible schema changes; even additive changes can stop older clients' sync.

## Branches and pull requests

For v4 work, branch from and target `v4-turborepo`. The root README's generic
contribution steps still name `main`; check the target explicitly. Follow recent
history: conventional branch names such as `docs/agent-guide` or `fix/sync-retry`
and commit/PR titles such as `docs: clarify contributor guidance`.

Keep changes focused and follow neighboring implementations. The pre-commit hook
runs `pnpm lint-staged`; let it format and lint staged files. Describe the behavior,
the existing implementation you followed, checks and results, and any unresolved
policy questions in the PR. Leave merging to the maintainer.
