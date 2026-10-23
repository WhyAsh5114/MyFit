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
- **lib/pool.ts** - `pg` pool for Better Auth and the `NutritionData` search table
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

Better Auth's tables and the Open Food Facts `NutritionData` table are not part of the synced contract: they use the plain `pg` pool in `lib/pool.ts`.

### Database commands

```bash
pnpm --filter @myfit/schema db:migrate     # Apply the on-disk Postgres migrations
pnpm --filter @myfit/api db:nutrition-data # Create/refresh the NutritionData search table
pnpm --filter @myfit/schema contract:emit:postgres # Re-emit the server contract after editing schema.prisma
```

Do not use `prisma db update` against a real database: it would drop `NutritionData`, which lives outside the Prisma contract.

- `pnpm start` - Run compiled app
- `pnpm lint` - ESLint
- `pnpm format` - Prettier formatting
