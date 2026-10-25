import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { gzipSync } from 'node:zlib';
import { Client } from 'pg';
import {
	CREATE_STAGING_TABLE_SQL,
	INSERT_INTO_NUTRITION_DATA_SQL
} from './utils/staging-schema.ts';

const execute = promisify(execFile);
const databaseUrl = process.env.NUTRITION_SEED_TEST_DATABASE_URL;
if (!databaseUrl)
	throw new Error('Set NUTRITION_SEED_TEST_DATABASE_URL to a migrated test Postgres database.');

/** Build a small OFF export, exercising the production mapper, filter and COPY stream. */
function fixture(rows: string[]): Buffer {
	return gzipSync(
		[
			'code\tproduct_name\tenergy-kcal_100g\tproteins_100g\tfat_100g\tcarbohydrates_100g\tunique_scans_n\tcompleteness\tsugars_100g',
			...rows,
			''
		].join('\n')
	);
}

test('seed deduplicates, refreshes without changing ids, and keeps zero-energy foods', async () => {
	const directory = await mkdtemp(path.join(tmpdir(), 'nutrition-seed-'));
	const schema = `nutrition_seed_test_${randomUUID().replaceAll('-', '')}`;
	const url = new URL(databaseUrl!);
	url.searchParams.set('options', `-csearch_path=${schema},public`);
	const client = new Client({ connectionString: url.toString() });
	/** Run the same importer as seed:off, with a tiny cached export and isolated table. */
	const seed = (env: NodeJS.ProcessEnv = {}) =>
		execute(process.execPath, [fileURLToPath(new URL('./main.ts', import.meta.url))], {
			env: {
				...process.env,
				DATABASE_URL: url.toString(),
				OFF_DATA_DIR: directory,
				ROW_LIMIT: '',
				REFRESH_OFF_DATA: '',
				SEED_IF_EMPTY: '',
				...env
			}
		});
	await client.connect();
	try {
		await client.query(`CREATE SCHEMA "${schema}"`);
		await client.query('CREATE TABLE "NutritionData" (LIKE public."NutritionData" INCLUDING ALL)');
		await writeFile(
			path.join(directory, 'products.csv.gz'),
			fixture([
				'water\tWater\t0\t0\t0\t0\t0\t1\t0',
				'milk\tMilk duplicate\t40\t3\t1\t4\t10\t1\t4',
				'milk\tMilk\t45\t3\t2\t4\t200\t1\t4',
				'missing\tMissing protein\t40\t\t1\t4\t0\t1\t0',
				'negative\tInvalid fat\t40\t3\t-1\t4\t0\t1\t0'
			])
		);
		await seed({ SEED_IF_EMPTY: '1' });
		const first = (await client.query('SELECT * FROM "NutritionData" ORDER BY code')).rows;
		assert.deepEqual(
			first.map((row) => [row.code, row.productName, row.energyKcal_100g]),
			[
				['milk', 'Milk', 45],
				['water', 'Water', 0]
			]
		);
		await seed();
		assert.deepEqual(
			(await client.query('SELECT * FROM "NutritionData" ORDER BY code')).rows,
			first
		);

		await writeFile(
			path.join(directory, 'products.csv.gz'),
			fixture(['milk\tMilk refreshed\t48\t4\t2\t5\t300\t0.8\t5'])
		);
		await seed();
		const refreshed = (await client.query('SELECT * FROM "NutritionData" ORDER BY code')).rows;
		assert.equal(refreshed.length, 2);
		assert.equal(refreshed[0].id, first[0].id);
		assert.equal(refreshed[0].productName, 'Milk refreshed');
		assert.equal(refreshed[0].sugarsG_100g, 5);
		assert.deepEqual(refreshed[1], first[1]);
		// Deploy restarts do not read the cache or modify an already populated table.
		await rm(path.join(directory, 'products.csv.gz'));
		await seed({ SEED_IF_EMPTY: '1' });

		await writeFile(
			path.join(directory, 'products.csv.gz'),
			fixture(['bad\tOverflow\t40\t3\t1\t4\t100000000000000000000\t1\t0'])
		);
		await assert.rejects(seed());
		assert.deepEqual(
			(await client.query('SELECT * FROM "NutritionData" ORDER BY code')).rows,
			refreshed
		);

		await client.query('TRUNCATE "NutritionData"');
		await writeFile(
			path.join(directory, 'products.csv.gz'),
			fixture(['one\tOne\t0\t0\t0\t0\t0\t1\t0', 'two\tTwo\t0\t0\t0\t0\t0\t1\t0'])
		);
		await seed({ ROW_LIMIT: '1' });
		assert.deepEqual((await client.query('SELECT code FROM "NutritionData"')).rows, [
			{ code: 'one' }
		]);
	} finally {
		await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
		await client.end();
		await rm(directory, { recursive: true, force: true });
	}
});

test('upsert skips null quality metrics before selecting duplicate food codes', async () => {
	const schema = `nutrition_seed_test_${randomUUID().replaceAll('-', '')}`;
	const client = new Client({ connectionString: databaseUrl });
	await client.connect();
	try {
		await client.query('BEGIN');
		await client.query(`CREATE SCHEMA "${schema}"`);
		await client.query(`SET LOCAL search_path TO "${schema}", public`);
		await client.query('CREATE TABLE "NutritionData" (LIKE public."NutritionData" INCLUDING ALL)');
		await client.query(CREATE_STAGING_TABLE_SQL);
		await client.query(`
			INSERT INTO nutrition_data_staging (
				code, product_name, completeness, unique_scans,
				energy_kcal_100g, proteins_g_100g, fat_g_100g, carbohydrates_g_100g
			) VALUES
				('milk', 'Milk', 1, 10, 45, 3, 2, 4),
				('milk', 'Invalid duplicate', NULL, 500, 40, 3, 1, 4),
				('missing-completeness', 'Missing completeness', NULL, 0, 40, 3, 1, 4),
				('missing-scans', 'Missing scans', 1, NULL, 40, 3, 1, 4),
				('water', 'Water', 0, 0, 0, 0, 0, 0)
		`);
		await client.query(INSERT_INTO_NUTRITION_DATA_SQL);
		assert.deepEqual(
			(await client.query('SELECT code, "productName" FROM "NutritionData" ORDER BY code')).rows,
			[
				{ code: 'milk', productName: 'Milk' },
				{ code: 'water', productName: 'Water' }
			]
		);
	} finally {
		await client.query('ROLLBACK');
		await client.end();
	}
});
