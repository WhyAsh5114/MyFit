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

## Database

Uses Prisma-IDB (offline-first browser database). The schema and generated contract live in `packages/schema`; `getDb()` in `src/lib/clients/idb-client.ts` migrates IndexedDB on first use and returns a sync-tracked client:

```typescript
import { getDb } from '$lib/clients/idb-client';

const { orm } = await getDb();
const meals = await orm.meal.where({ userId }).all();
```

## Internationalization

Translations are in `messages/en.json`. The app uses Paraglide for i18n:

```typescript
import * as m from '$lib/paraglide/messages';

const greeting = m.hello();
```

## Scripts

- `pnpm dev` - Development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Type-check
- `pnpm lint` - Lint and format check
- `pnpm format` - Auto-format code
