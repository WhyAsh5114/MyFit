# Run the tests and screenshots

Which test to write is in [Testing](../reference/testing.md). This page is how to run each suite.

## Unit tests

```bash
pnpm --filter @myfit/frontend test     # Vitest, tests/**/*.test.ts
```

They need nothing running. IndexedDB comes from `fake-indexeddb`.

## API tests

They need a migrated Postgres database. See [Run the API tests](../../apps/api/docs/testing.md).

## End-to-end tests

The Playwright specs in `apps/frontend/tests/e2e` run against the production build, a real API and Postgres. Playwright starts a mail stub (in place of Resend, so tests read sign-in codes without sending email), the API (needs `bun`) and the build itself.

1. Start Postgres and apply the migrations:

   ```bash
   docker run -d -p 5432:5432 -e POSTGRES_USER=myfit -e POSTGRES_PASSWORD=password -e POSTGRES_DB=myfit postgres:16-alpine
   DATABASE_URL=postgresql://myfit:password@localhost:5432/myfit pnpm --filter @myfit/shared db:migrate
   ```

2. Install the browser once: `pnpm --filter @myfit/frontend exec playwright install chromium`.
3. Run them: `pnpm --filter @myfit/frontend test:e2e`.

Set `TEST_DATABASE_URL` to use another database.

## Screenshots

`pnpm --filter @myfit/frontend screenshots` captures every screen of the built app in light and dark at 390 × 844, checks tap targets, and builds a gallery. It starts its own mail stub, API (ports 3001 and 4010) and production build on port 4273, so it can run beside `pnpm dev`.

It needs a Postgres server. It creates a disposable database, applies the migrations and seeds a few foods for search. The default is the dev container's server:

```bash
pnpm screenshots                                                       # postgresql://postgres:postgres@localhost:5432/myfit_screenshots
SCREENSHOT_DATABASE_URL=postgresql://user:pass@host:5432/name pnpm screenshots
SCREENSHOT_FORMAT=png pnpm screenshots                                 # lossless images instead of JPEG
```

Output goes to `apps/frontend/screenshots/` (ignored by git): `light/` and `dark/` images, `index.html` to browse them, and `gallery.html`, one file with the images embedded. `pnpm screenshots:gallery` rebuilds the gallery without recapturing.

Chat replies are scripted, and the camera screen shows the headless browser's no-camera state. To add a screen, add a `shot(...)` call in `tests/screenshots/screens.spec.ts`.
