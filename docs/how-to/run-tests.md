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

Two commands: `pnpm screenshots` makes new images, and `pnpm screenshots:serve` shows the ones you have.

`pnpm --filter @myfit/frontend screenshots` captures every screen of the built app in light and dark at 390 × 844 and checks tap targets. It starts its own mail stub, API (ports 3001 and 4010) and production build on port 4273, so it can run beside `pnpm dev`.

It needs a Postgres server. It creates a disposable database, applies the migrations and seeds a few foods for search. The default is the dev container's server:

```bash
pnpm screenshots                                                       # postgresql://postgres:postgres@localhost:5432/myfit_screenshots
SCREENSHOT_DATABASE_URL=postgresql://user:pass@host:5432/name pnpm screenshots
SCREENSHOT_FORMAT=png pnpm screenshots                                 # lossless images instead of JPEG
```

Output goes to `apps/frontend/screenshots/` (ignored by git): `light/` and `dark/` images, a `tap-targets.txt` per theme, and `manifest.json`, which lists the screens.

To browse them, serve the last capture as a canvas with one row of screens per area. It only reads `screenshots/`, needs nothing else running, and shows a new capture when you reload:

```bash
pnpm screenshots:serve                     # http://localhost:4280
SCREENSHOT_PORT=5000 pnpm screenshots:serve
```

On the canvas, drag or scroll to pan, and hold Ctrl or ⌘ while scrolling (or pinch) to zoom. Light, Dark and Both switch the theme of the screens, and the area menu jumps to a row. Click a screen to enlarge it, then use the arrow keys to step through them.

Chat replies are scripted, and the camera screen shows the headless browser's no-camera state. To add a screen, add a `shot(...)` call in `tests/screenshots/screens.spec.ts`.
