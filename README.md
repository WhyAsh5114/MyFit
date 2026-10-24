# MyFit

A comprehensive fitness platform that tracks macros, workouts, and more—powered by science-based recommendations tailored to your data.

## 🏗️ Project Structure

This is a monorepo managed with [Turborepo](https://turbo.build) and [pnpm](https://pnpm.io).

```
.
├── apps/
│   ├── api/          # Backend API (Hono + Better Auth + Prisma)
│   └── frontend/     # Web/mobile app (SvelteKit + Capacitor)
├── packages/
└── turbo.json        # Turborepo configuration
```

## 📦 What's Inside

- **[API](./apps/api/README.md)** - REST API with authentication and database (Hono + Prisma)
- **[Frontend](./apps/frontend/README.md)** - Web app and mobile clients (iOS/Android via Capacitor)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** 10+
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

See [Frontend README](./apps/frontend/README.md) for detailed mobile setup.

## 🗄️ Database

MyFit uses [Prisma 8](https://www.prisma.io) with a PostgreSQL database on the server and [Prisma IDB](https://github.com/prisma-idb/prisma-idb) (IndexedDB) in the browser for offline-first use. Both read one schema: `packages/schema/src/schema.prisma`.

### Change the schema

After you edit `schema.prisma`, run one command from the repository root. Pick a short name for the migration:

```bash
pnpm --filter @myfit/schema schema:sync add-meal-notes
```

`schema:sync` runs these steps in order, then formats the generated files:

1. `contract:emit` writes the browser contract.
2. `migration:plan` plans the IndexedDB migration.
3. `migration:contract-space` bundles the IndexedDB migration chain for the browser. If you skip this step, the browser sends the old chain and every sync request fails with a contract mismatch.
4. `migration:preflight` applies the chain to a fake IndexedDB and checks it matches the new contract.
5. `contract:emit:postgres` writes the server contract.
6. `migration:postgres:plan` plans the Postgres migration.

Commit everything the command changes. When the schema did not change, the command changes nothing.

If a change drops or renames data, the planners refuse and list the questions. Run the steps individually and pass the `--rename` or `--delete` flags the planner prints. To write a Postgres data migration by hand, use `pnpm --filter @myfit/schema migration:postgres:new`.

Apply the Postgres migrations with `pnpm --filter @myfit/schema db:migrate`.

See the [API README](./apps/api/README.md) for the server side.

## 🔐 Environment Variables

Create a `.env` file in each app directory. Examples:

**API** (`.env` in `apps/api`):

```
DATABASE_URL=postgresql://user:password@localhost:5432/myfit
```

**Frontend** (`.env` in `apps/frontend`):

```
PUBLIC_API_URL=http://localhost:3000
```

## 🏗️ Building for Production

```bash
# Build all packages
pnpm build

# API outputs to apps/api/dist/
# Frontend outputs to apps/frontend/build/
```

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm lint` and `pnpm format`
4. Push and create a PR

## 📚 Tech Stack

- **Frontend** - SvelteKit, Tailwind CSS, Capacitor, Paraglide (i18n)
- **Backend** - Hono, Better Auth, Prisma
- **Database** - PostgreSQL
- **Tooling** - TypeScript, Turbo, pnpm, ESLint, Prettier

## 📖 Learn More

- [Turborepo Docs](https://turbo.build/repo/docs)
- [SvelteKit Docs](https://kit.svelte.dev)
- [Hono Docs](https://hono.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
