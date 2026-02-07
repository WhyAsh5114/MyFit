# @myfit/db

Shared database layer for MyFit. Provides Prisma ORM for both server and browser environments.

## Setup

1. Create `.env`:
   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/myfit_dev
   ```

2. Generate the Prisma client:
   ```bash
   pnpm generate
   ```

3. Push schema to database:
   ```bash
   pnpm push
   ```

## Usage

### Server-side (API)

Use standard Prisma Client in `apps/api`:

```typescript
import { PrismaClient } from '@myfit/db';

const prisma = new PrismaClient();
const users = await prisma.user.findMany();
const user = await prisma.user.create({
  data: { email: 'user@example.com' }
});
```

### Browser-side (Frontend)

Use Prisma-IDB for offline-first IndexedDB:

```typescript
import { prismaIdbClient } from '@myfit/db/prisma-idb/client';

const users = await prismaIdbClient.user.findMany();
await prismaIdbClient.user.create({
  data: { email: 'user@example.com' }
});
```

### Validation

Use Zod validators generated from the schema:

```typescript
import { validators } from '@myfit/db/prisma-idb/server';

validators.User.parse(userData);
```

## Schema

Edit `prisma/schema.prisma` to modify the database structure. Example model:

```prisma
model User {
  id    String   @id @default(cuid())
  email String   @unique
  name  String?
  createdAt DateTime @default(now())
}
```

## Commands

```bash
pnpm generate       # Generate Prisma client & validators
pnpm push          # Push schema changes to database
pnpm studio        # Open Prisma Studio (GUI)
pnpm migrate       # Run migrations (if using migrate vs push)
```

## Workflow

1. **Update schema** - Edit `prisma/schema.prisma`
2. **Generate** - Run `pnpm generate` to update client
3. **Sync database** - Run `pnpm push` to apply changes
4. **Use in apps** - Import `@myfit/db` in API and frontend

## File Structure

```
prisma/
├── schema.prisma          # Prisma schema definition
└── migrations/            # Migration history

generated/
├── prisma/                # Server-side Prisma Client
│   ├── client.ts
│   ├── models.ts
│   └── enums.ts
└─-IDB
    ├── client/
    ├── server/
    └── validators.ts
```

## Tips

- ✅ Use `pnpm push` for schema-first development (recommended)
- 📝 Always generate after schema changes
- 🔄 Sync mobile apps with `pnpm exec cap sync` after database updates
- 🐛 Use `pnpm studio` to browse data visually
