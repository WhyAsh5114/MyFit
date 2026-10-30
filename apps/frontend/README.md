# Frontend

The MyFit web and mobile app. Built with [SvelteKit](https://kit.svelte.dev), [Tailwind CSS](https://tailwindcss.com), and [Capacitor](https://capacitorjs.com) for iOS/Android.

## Quick Start

```bash
pnpm install
pnpm dev
```

App runs on `http://localhost:5173`.

## Environment Setup

Copy `.env.example` to `.env`. SvelteKit reads the `PUBLIC_*` variables at build time, so `pnpm check` and `pnpm build` need them.

## Development

```bash
pnpm dev           # Start dev server
pnpm build         # Build for web
pnpm preview       # Preview production build
pnpm check         # Type-check
pnpm lint          # ESLint + Prettier check
pnpm format        # Format code
```

## Project Structure

```
src/
├── routes/        # SvelteKit pages and API routes
├── lib/
│   ├── components/    # Reusable Svelte components
│   ├── hooks/         # Svelte hooks
│   ├── auth-client.ts # Auth utilities
│   ├── idb-client.ts  # IndexedDB utilities
│   └── utils.ts       # Helper functions
├── app.html       # HTML entry point
└── app.d.ts       # Global types
```

## Features

- 🎨 **Tailwind CSS** - Utility-first styling
- 🌍 **i18n** - Multilingual support via Paraglide
- 📲 **Mobile-ready** - Capacitor for native iOS/Android
- 💾 **Offline-first** - IndexedDB with Prisma-IDB
- ♿ **Accessible** - Semantic HTML and ARIA
- 🎭 **Themes** - Dark/light

# Build web assets

```bash
pnpm build
```

# Sync to Xcode

```bash
pnpm exec cap sync ios
pnpm exec cap open ios
```

# In Xcode

Select target device and press Run

### Android

```bash
# Install Android SDK via Android Studio first

# Sync to Android Studio
pnpm exec cap sync android
pnpm exec cap open android

# In Android Studio: Select emulator/device and click Run
```

### Workflow

1. Make changes in `src/`
2. `pnpm dev` to see changes in browser
3. When ready to test on device:
   ```bash
   pnpm build
   pnpm exec cap sync
   ```
4. Open in Xcode/Android Studio and run

To load the Vite dev server in the native app instead of the bundled build, set `CAPACITOR_DEV_SERVER_URL` before `cap sync`. Use `http://localhost:5173` for both. On the Android emulator, first run `adb reverse tcp:5173 tcp:5173` (and `tcp:3000` for a local API); `http://10.0.2.2` is not a secure context, so the app fails without `crypto.randomUUID`. Leave it unset for release builds.

### Releases

The `version` in `package.json` is the app version for both platforms. It is bumped by hand in the release commit. Web-only changes ship over the air and don't need a new version.

Android's `versionName` and `versionCode` are read from it by `android/app/build.gradle`. An Xcode project can't read it, so `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION` in the project (`1.0` and `1`) are placeholders. Pass the real values when archiving:

```bash
xcodebuild archive -project ios/App/App.xcodeproj -scheme App $(node scripts/native-version.js)
```

## Database

Uses Prisma-IDB (offline-first browser database). The schema and generated contract live in `packages/shared`; `getDb()` in `src/lib/clients/idb-client.ts` migrates IndexedDB on first use and returns a sync-tracked client:

```typescript
import { getDb } from '#lib/clients/idb-client.js';

const { orm } = await getDb();
const meals = await orm.meal.where({ userId }).all();
```

## Internationalization

Translations are in `messages/en.json`. The app uses Paraglide for i18n:

```typescript
import * as m from '#lib/paraglide/messages.js';

const greeting = m.hello();
```

## Testing

`pnpm test` runs the unit tests with Vitest (`tests/lib`).

`pnpm test:e2e` runs the Playwright specs in `tests/e2e` against the built app, a real API and Postgres. It covers sign-in, logout, the single-tab lock, session expiry and switching accounts. Start Postgres and apply the migrations first:

```bash
docker run -d -p 5432:5432 -e POSTGRES_USER=myfit -e POSTGRES_PASSWORD=password -e POSTGRES_DB=myfit postgres:16-alpine
DATABASE_URL=postgresql://myfit:password@localhost:5432/myfit pnpm --filter @myfit/shared db:migrate
pnpm exec playwright install chromium
pnpm test:e2e
```

Set `TEST_DATABASE_URL` to use another database. Playwright starts a mail stub, the API (needs `bun`) and the production build itself. The stub stands in for Resend, so tests read sign-in codes without sending email.

## Scripts

- `pnpm dev` - Development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Type-check
- `pnpm test` - Unit tests
- `pnpm test:e2e` - End-to-end tests
- `pnpm lint` - Lint and format check
- `pnpm format` - Auto-format code
