import 'dotenv/config';
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig } from '@prisma-idb/sync-server/postgres';

/**
 * Server (Postgres) side. Reads the same `src/schema.prisma`, strips the
 * `@idb.exclude` attributes and appends the sync `Changelog` model in memory.
 *
 * `pnpm schema:sync <name>` emits the contract and plans the migration. Create the
 * schema with `pnpm db:migrate`. Write a data migration by hand with
 * `pnpm migration:postgres:new --from <storageHash> --name <name>`. The hash is
 * in `src/schema.postgres.generated.json`; without `--from` the command fails
 * on an unchanged schema.
 */
export default definePrismaConfig({
	orm: defineConfig({
		schema: 'src/schema.prisma',
		// Explicit: the default would collide with the browser's contract.json.
		output: 'src/schema.postgres.generated.json',
		db: {
			connection: process.env.DATABASE_URL ?? ''
		},
		// Separate history from the browser's `migrations/`.
		migrations: {
			dir: 'migrations-postgres'
		}
	})
});
