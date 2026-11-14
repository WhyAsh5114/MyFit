# MyFit

A comprehensive fitness platform that tracks macros, workouts, and more—powered by science-based recommendations tailored to your data.

## 🏗️ Project Structure

This is a monorepo managed with [Turborepo](https://turbo.build) and [pnpm](https://pnpm.io).

```
.
├── apps/
│   ├── api/          # Backend API (Hono + Better Auth + Prisma 8)
│   └── frontend/     # Web/mobile app (SvelteKit + Capacitor)
├── packages/
│   └── shared/       # Prisma schema, generated contracts and sync server (@myfit/shared)
└── turbo.json        # Turborepo configuration
```

## 📦 What's Inside

- **[API](./apps/api/README.md)** - REST API with authentication and database (Hono + Prisma 8)
- **[Frontend](./apps/frontend/README.md)** - Web app and mobile clients (iOS/Android via Capacitor)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 24+
- **pnpm** 12+
- **PostgreSQL** (for development)

### Installation

```bash
# Clone and install
git clone https://github.com/WhyAsh5114/MyFit
cd MyFit
pnpm install
```

### Development

```bash
# Start all dev servers (API, frontend)
pnpm dev

# Frontend only
cd apps/frontend && pnpm dev

# API only
cd apps/api && pnpm dev
```

Visit `http://localhost:5173` for the frontend and `http://localhost:3000` for the API.

## 🛠️ Available Commands

Run these from the root:

```bash
pnpm dev       # Start all dev servers
pnpm build     # Build all packages
pnpm lint      # Lint all packages
pnpm format    # Format with Prettier
pnpm check     # Type-check all packages
```

## 🔗 Monorepo Patterns

### Workspace Dependencies

Packages reference each other using `workspace:*`:

```json
{
	"dependencies": {
		"@myfit/api": "workspace:*"
	}
}
```

### Turborepo Tasks

All tasks (build, lint, dev) run in dependency order. The `^` prefix ensures dependencies build first:

```json
{
	"tasks": {
		"build": {
			"dependsOn": ["^build"]
		}
	}
}
```

## 📱 Mobile Development

The frontend is a [SvelteKit](https://kit.svelte.dev) app wrapped with [Capacitor](https://capacitorjs.com) for iOS and Android.

```bash
cd apps/frontend

# Build for web
pnpm build

# Set up mobile
pnpm exec cap sync        # Sync web assets to native projects
pnpm exec cap open ios    # Open Xcode
pnpm exec cap open android # Open Android Studio
```

See [Release the app](docs/how-to/release.md) for running on a device and releasing.

## 🗄️ Database

MyFit uses [Prisma 8](https://www.prisma.io) with a PostgreSQL database on the server and [Prisma IDB](https://github.com/prisma-idb/prisma-idb) (IndexedDB) in the browser for offline-first use. Both read one schema: `packages/shared/src/schema.prisma`.

To change the schema, follow [Change the database schema](docs/how-to/change-the-schema.md).

See the [API README](./apps/api/README.md) for the server side.

## 🔐 Environment Variables

Copy `.env.example` to `.env` in each app directory (`apps/api` and `apps/frontend`), then fill in the values. The example files list every variable and say which are required.

## 🏗️ Building for Production

```bash
# Build all packages
pnpm build

# API outputs to apps/api/dist/
# Frontend outputs to apps/frontend/build/
```

## 🤝 Contributing

Start with [`docs/`](docs/README.md): how the app is built, where code goes, and how to test it. `v4-turborepo` is the working branch.

1. Branch from `v4-turborepo`.
2. Make your change, with its tests and docs.
3. Run `pnpm lint`, `pnpm check` and `pnpm --filter @myfit/frontend test`.
4. Push and open a PR.

## 📚 Tech Stack

- **Frontend** - SvelteKit, Tailwind CSS, Capacitor, Paraglide (i18n)
- **Backend** - Hono, Better Auth, Prisma 8
- **Database** - PostgreSQL
- **Tooling** - TypeScript, Turbo, pnpm, ESLint, Prettier

## 📖 Learn More

- [Turborepo Docs](https://turbo.build/repo/docs)
- [SvelteKit Docs](https://kit.svelte.dev)
- [Hono Docs](https://hono.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
