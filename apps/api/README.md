# @myfit/api

Backend API for MyFit. Built with [Hono](https://hono.dev) and [Better Auth](https://better-auth.com).

## Quick Start

```bash
pnpm install
pnpm dev
```

API runs on `http://localhost:3000`.

## Environment Setup

Create a `.env` file:

```
DATABASE_URL=postgresql://user:password@localhost:5432/myfit_dev
BETTER_AUTH_SECRET=your-secret-key-here
```

## Development

```bash
pnpm dev      # Start dev server with auto-reload
pnpm build    # Build to dist/
pnpm start    # Run production build
```

## API Structure

- **lib/auth.ts** - Better Auth setup
- **lib/db.ts** - Prisma 8 Postgres client for the synced models
- **lib/pool.ts** - `pg` pool for Better Auth
- **src/index.ts** - Main server and route definitions

## Key Features

- 🔐 **Authentication** - Google & GitHub OAuth via Better Auth
- 🗄️ **Database** - PostgreSQL + Prisma 8
- ⚡ **Fast** - Built on Hono's minimal footprint
- 📝 **Type-safe** - Full TypeScript support

## Database

The schema is shared with the browser and lives in `packages/schema` (`src/schema.prisma`). The API talks to Postgres through Prisma 8 (`@prisma/orm-postgres`) and syncs with the browser's IndexedDB via `@prisma-idb/sync-server`.

```typescript
import { getDb } from './lib/db.js';

const db = await getDb();
```

Better Auth reads and writes its own tables through the plain `pg` pool in `lib/pool.ts`. The Open Food Facts `NutritionData` table is part of the server contract (marked `@@idb.exclude`, so it never reaches the browser). Its weighted full-text and trigram indexes are declared with `@@index(expression: ...)` to fold accents through `public.immutable_unaccent(...)`. The migrations create those indexes and the search extensions. Fill it with the Open Food Facts seed under `prisma/seed/open-food-facts`.

This release requires a fresh Postgres database. Create an empty database before deploying; the baseline replaces the earlier migration history. Existing databases cannot migrate in place. After migration, reload Open Food Facts data and use fresh browser storage before reconnecting clients.

The baseline installs `pg_trgm` and `unaccent` before creating the full-text and trigram indexes on `public.immutable_unaccent(...)`. The wrapper pins the `public.unaccent` dictionary; rebuild those indexes if the dictionary changes.

### Synced User writes

`POST /api/sync/push` allows User updates only to `name`, `image`, and `autoUpdate`. Other User fields, including `email`, `emailVerified`, and `isAnonymous`, belong to Better Auth. Account creation and deletion must also use Better Auth.

A forbidden User write returns HTTP 403 and rejects the entire batch before any SQL writes. The current client retains that batch for retry. Other model writes and sync pulls retain their existing ownership checks.

Run the HTTP write-policy tests with Node 24 or later. They need no database or auth credentials:

```bash
pnpm --filter @myfit/api test:sync
```

### Database commands

```bash
pnpm --filter @myfit/schema db:migrate     # Apply the on-disk Postgres migrations
pnpm --filter @myfit/schema schema:sync <name>     # After editing schema.prisma: emit contracts and plan both migrations
```

- `pnpm start` - Run compiled app
- `pnpm lint` - ESLint
- `pnpm format` - Prettier formatting
