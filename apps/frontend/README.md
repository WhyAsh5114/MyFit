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

## Project structure

Where code goes is in [Architecture](../../docs/reference/architecture.md), and how data is read and written in [Data layer](../../docs/reference/data-layer.md).

## Features

- 🎨 **Tailwind CSS** - Utility-first styling
- 🌍 **i18n** - Multilingual support via Paraglide
- 📲 **Mobile-ready** - Capacitor for native iOS/Android
- 💾 **Offline-first** - IndexedDB with Prisma-IDB
- ♿ **Accessible** - Semantic HTML and ARIA
- 🎭 **Themes** - Dark/light

## Mobile

Building for iOS and Android, running on a device and releasing are in [Release the app](../../docs/how-to/release.md).

## Testing and screenshots

See [Run the tests and screenshots](../../docs/how-to/run-tests.md), and [Testing](../../docs/reference/testing.md) for which test to write.

## Scripts

- `pnpm dev` - Development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Type-check
- `pnpm test` - Unit tests
- `pnpm test:e2e` - End-to-end tests
- `pnpm screenshots` - Capture every screen and build a gallery
- `pnpm lint` - Lint and format check
- `pnpm format` - Auto-format code
