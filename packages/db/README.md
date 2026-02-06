# @mymacros/db

Shared database layer for MyMacros using Prisma.

## Setup

1. Copy `.env.example` to `.env` and configure your database connection:
   ```bash
   cp .env.example .env
   ```

2. Generate the Prisma client:
   ```bash
   pnpm generate
   ```

3. Push the schema to your database:
   ```bash
   pnpm push
   ```

## Usage

Both `api` and `frontend` apps can import the Prisma client:

```typescript
import { PrismaClient } from '@mymacros/db';

const prisma = new PrismaClient();
```

## Commands

- `pnpm generate` - Generate Prisma client
- `pnpm push` - Push schema changes to database
- `pnpm studio` - Open Prisma Studio

## Migrations

To create a new migration after modifying the schema:

```bash
pnpm exec prisma migrate dev --name <migration_name>
```

The migration files are stored in `prisma/migrations/`.
