// Brings every generated artifact in line with `src/schema.prisma`:
//
//   pnpm schema:sync <migration-name>
//
// The steps depend on each other, so the order matters:
//   1. emit the browser contract, which the IndexedDB planner reads;
//   2. plan the IndexedDB migration, which also bundles the migration chain into
//      `src/generated/contract-space.generated.ts`. A stale chain makes every sync request fail with a
//      contract mismatch;
//   3. preflight the chain against fake-indexeddb;
//   4. emit the server contract, which the Postgres planner reads;
//   5. plan the Postgres migration, starting from the newest one on disk. Prisma has no "head of
//      the graph" default: it plans from the `db` ref, which only the dev-database commands
//      (`db init`, `db update`) move and this repo never runs, so a plan without `--from` would
//      start from a stale point and fork the migration graph.
// On an unchanged schema every planner reports "nothing to do" and the working tree stays clean.
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

/** The emitters write these unformatted, but they are committed formatted. */
const GENERATED_DIR = 'src/generated';

const POSTGRES_MIGRATIONS_DIR = 'migrations-postgres/app';

const name = process.argv[2];
if (!name) {
	console.error('Usage: pnpm schema:sync <migration-name>   (for example: add-meal-notes)');
	process.exit(1);
}

/**
 * Runs `pnpm <args>` in this package and exits with its status if it fails, so a failed step
 * never leaves later steps working from stale output.
 * @param {string[]} args
 */
function pnpm(args) {
	console.log(`\n> pnpm ${args.join(' ')}`);
	const { status } = spawnSync('pnpm', args, { stdio: 'inherit' });
	if (status !== 0) process.exit(status ?? 1);
}

pnpm(['run', 'contract:emit']);
pnpm(['run', 'migration:plan', '--name', name]);
pnpm(['run', 'migration:preflight']);
pnpm(['run', 'contract:emit:postgres']);
// Migration directories start with a timestamp, so the last one by name is the newest. `--from`
// takes the directory's name, not its path.
const latestPostgresMigration = readdirSync(POSTGRES_MIGRATIONS_DIR, { withFileTypes: true })
	.filter((entry) => entry.isDirectory() && entry.name !== 'refs')
	.map((entry) => entry.name)
	.sort()
	.at(-1);
pnpm(['run', 'migration:postgres:plan', '--name', name, '--from', latestPostgresMigration]);
// `.prettierignore` skips these files so `lint` leaves them alone, hence `--ignore-path`.
pnpm(['exec', 'prettier', '--write', '--ignore-path', '/dev/null', GENERATED_DIR]);
