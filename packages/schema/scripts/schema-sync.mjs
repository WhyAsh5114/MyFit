// Brings every generated artifact in line with `src/schema.prisma`:
//
//   pnpm schema:sync <migration-name>
//
// The steps depend on each other, so the order matters:
//   1. emit the browser contract, which the IndexedDB planner reads;
//   2. plan the IndexedDB migration, which also bundles the migration chain into
//      `contract-space.generated.ts`. A stale chain makes every sync request fail with a
//      contract mismatch;
//   3. preflight the chain against fake-indexeddb;
//   4. emit the server contract, which the Postgres planner reads;
//   5. plan the Postgres migration.
// On an unchanged schema every planner reports "nothing to do" and the working tree stays clean.
import { spawnSync } from 'node:child_process';

/** Generated files the emitters write unformatted, but which are committed formatted. */
const GENERATED_FILES = [
	'src/contract.json',
	'src/contract.d.ts',
	'src/contract-space.generated.ts',
	'src/contract.runtime.ts',
	'src/schema.postgres.generated.runtime.ts',
	'src/schema.postgres.generated.json',
	'src/schema.postgres.generated.d.ts'
];

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
pnpm(['run', 'migration:postgres:plan', '--name', name]);
// `.prettierignore` skips these files so `lint` leaves them alone, hence `--ignore-path`.
pnpm(['exec', 'prettier', '--write', '--ignore-path', '/dev/null', ...GENERATED_FILES]);
