// Captures every screen in light and dark and builds a gallery. Usage:
//   pnpm screenshots [--no-gallery]
// Set SCREENSHOT_DATABASE_URL to point at a Postgres server. The database is created, migrated
// and seeded for you, and nothing in it is precious.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const frontend = join(import.meta.dirname, '../..');
const repo = join(frontend, '../..');
const url =
	process.env.SCREENSHOT_DATABASE_URL ??
	'postgresql://postgres:postgres@localhost:5432/myfit_screenshots';
const dbName = decodeURIComponent(new URL(url).pathname.slice(1));
if (!/^[\w-]+$/.test(dbName)) throw new Error(`Unsupported database name: ${dbName}`);

// `pg` lives with the API; borrow it instead of adding a dependency here.
const { Client } = createRequire(join(repo, 'apps/api/package.json'))('pg');

/** Sample foods for search and the food detail screens. The remote food database is empty here. */
const FOODS = [
	[
		'n1',
		'5000000000011',
		'Greek Yogurt, Plain',
		'Fage',
		97,
		3.9,
		5,
		9,
		0,
		3.9,
		3.4,
		36,
		0.09,
		900,
		'1 pot (170 g)',
		170
	],
	[
		'n2',
		'5000000000028',
		'Rolled Oats',
		'Quaker',
		372,
		60,
		7.5,
		13,
		10,
		1,
		1.4,
		6,
		0.02,
		800,
		'1 serving (40 g)',
		40
	],
	[
		'n3',
		'5000000000035',
		'Chicken Breast, Grilled',
		'Tesco',
		165,
		0,
		3.6,
		31,
		0,
		0,
		1,
		74,
		0.19,
		700,
		'1 breast (120 g)',
		120
	],
	[
		'n4',
		'5000000000042',
		'Whole Milk',
		'Arla',
		64,
		4.8,
		3.6,
		3.3,
		0,
		4.8,
		2.3,
		43,
		0.1,
		600,
		'1 glass (250 ml)',
		250
	],
	[
		'n5',
		'5000000000059',
		'Peanut Butter, Crunchy',
		'Skippy',
		598,
		19,
		50,
		25,
		6,
		9,
		10,
		430,
		1.1,
		500,
		'2 tbsp (32 g)',
		32
	],
	[
		'n6',
		'5000000000066',
		'Banana',
		null,
		89,
		23,
		0.3,
		1.1,
		2.6,
		12,
		0.1,
		1,
		0,
		400,
		'1 medium (118 g)',
		118
	]
];

async function prepareDatabase() {
	const admin = new Client({ connectionString: url.replace(/\/[^/?]*(\?|$)/, '/postgres$1') });
	await admin.connect();
	const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
	if (!rowCount) await admin.query(`CREATE DATABASE "${dbName}"`);
	await admin.end();

	console.log(`Migrating ${dbName}...`);
	const migrate = spawnSync('pnpm', ['--filter', '@myfit/shared', 'db:migrate'], {
		cwd: repo,
		env: { ...process.env, DATABASE_URL: url },
		encoding: 'utf8'
	});
	if (migrate.status !== 0)
		throw new Error(`Migration failed:\n${migrate.stdout}\n${migrate.stderr}`);

	const db = new Client({ connectionString: url });
	await db.connect();
	for (const f of FOODS) {
		await db.query(
			`INSERT INTO "NutritionData" (id, code, "productName", brands, "energyKcal_100g", "carbohydratesG_100g",
				"fatG_100g", "proteinsG_100g", "fiberG_100g", "sugarsG_100g", "saturatedFatG_100g", "sodiumMg_100g",
				"saltG_100g", completeness, "uniqueScans", "servingSize", "servingQuantity")
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,0.9,$14,$15,$16)
			 ON CONFLICT (code) DO NOTHING`,
			f
		);
	}
	await db.end();
}

await prepareDatabase();

const args = process.argv.slice(2);
const run = (command, commandArgs) =>
	spawnSync(command, commandArgs, {
		cwd: frontend,
		stdio: 'inherit',
		env: { ...process.env, SCREENSHOT_DATABASE_URL: url }
	}).status ?? 1;

const status = run('pnpm', [
	'exec',
	'playwright',
	'test',
	'-c',
	'playwright.screenshots.config.ts'
]);
if (status !== 0) process.exit(status);
if (!args.includes('--no-gallery'))
	process.exit(run('node', ['scripts/screenshots/build-gallery.mjs']));
