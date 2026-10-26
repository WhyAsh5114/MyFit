import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import postgres from '@prisma/orm-postgres/runtime';
import { Client } from 'pg';
import type { ServerContract } from '@myfit/shared/server';

/** Create an isolated food table shared by integration tests and the benchmark. */
export async function createSearchFixture() {
	const databaseUrl = process.env.TEST_DATABASE_URL;
	if (!databaseUrl) throw new Error('Set TEST_DATABASE_URL to a test Postgres database.');
	const schema = `nutrition_search_test_${randomUUID().replaceAll('-', '')}`;
	const admin = new Client({ connectionString: databaseUrl });
	const url = new URL(databaseUrl);
	url.searchParams.set('options', `-csearch_path=${schema},public`);
	const contractJson = JSON.parse(
		await readFile(
			new URL(
				'../../../../../packages/shared/src/generated/postgres-contract.json',
				import.meta.url
			),
			'utf8'
		)
	);
	const db = postgres<ServerContract>({ contractJson });

	await admin.connect();
	await admin.query(`CREATE SCHEMA "${schema}"`);
	const table = `"${schema}"."NutritionData"`;
	await admin.query(`CREATE TABLE ${table} (
		id text PRIMARY KEY, code text NOT NULL, "productName" text NOT NULL, brands text,
		"energyKcal_100g" float8 NOT NULL DEFAULT 100, "servingSize" text,
		"servingQuantity" float8, "uniqueScans" int NOT NULL, completeness float8 DEFAULT 1
	)`);
	await db.connect({ url: url.toString() });
	return {
		db,
		admin,
		table,
		/** Drop only the fixture schema, then close both database connections. */
		async close() {
			await db.close();
			await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
			await admin.end();
		}
	};
}
