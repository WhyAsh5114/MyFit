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
- **lib/prisma.ts** - Prisma client instance
- **src/index.ts** - Main server and route definitions

## Key Features

- 🔐 **Authentication** - Google & GitHub OAuth via Better Auth
- 🗄️ **Database** - PostgreSQL + Prisma ORM
- ⚡ **Fast** - Built on Hono's minimal footprint
- 📝 **Type-safe** - Full TypeScript support

## Database

Prisma ORM with PostgreSQL. The schema, migrations, and Prisma config are in this package:

```typescript
import { prisma } from './lib/prisma.js';

const users = await prisma.user.findMany();
```

### Prisma Commands

```bash
pnpm generate     # Generate Prisma client and Prisma-IDB
pnpm push         # Push schema changes to database
pnpm studio       # Open Prisma Studio
```

### TypedSQL Queries

Define SQL queries in `prisma/sql/` and use them with full type safety:

```typescript
import { myQuery } from '../generated/prisma/sql/myQuery.js';

const results = await prisma.$queryRawTyped(myQuery(params));
```
- `pnpm start` - Run compiled app
- `pnpm lint` - ESLint
- `pnpm format` - Prettier formatting
