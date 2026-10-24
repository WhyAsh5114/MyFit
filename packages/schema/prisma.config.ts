import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma-idb/family-idb/config-types';
import { prismaIdbContract } from '@prisma-idb/family-idb/contract-psl';
import idbFamily from '@prisma-idb/family-idb/control';
import idbTarget from '@prisma-idb/target-idb/control';
import idbAdapter from '@prisma-idb/adapter-idb/control';
import idbDriver from '@prisma-idb/driver-idb/control';

/**
 * Browser (IndexedDB) side. `projection: "client"` drops every
 * `@idb.exclude` member so server-only state (auth tables) never reaches the bundle.
 *
 * Emit with `pnpm contract:emit`, then `pnpm migration:plan`,
 * `pnpm migration:contract-space` and `pnpm migration:preflight`.
 */
export default definePrismaConfig({
	orm: ormConfig({
		family: idbFamily,
		target: idbTarget,
		adapter: idbAdapter,
		driver: idbDriver,
		db: {
			connection: ':memory:' // unused by IndexedDB; required by the framework
		},
		contract: prismaIdbContract('src/schema.prisma', { projection: 'client' }),
		migrations: {
			dir: 'migrations'
		}
	})
});
