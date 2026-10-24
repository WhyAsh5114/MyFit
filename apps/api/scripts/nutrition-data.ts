import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

// Creates the `NutritionData` search table, its extensions and indexes.
// Idempotent; run it after `prisma db init`/`db update` (see entrypoint.sh).
// Deliberately standalone (no lib/env.ts): it only needs DATABASE_URL.
if (!process.env.DATABASE_URL)
	throw new Error('Missing required environment variable: DATABASE_URL');

const sql = await readFile(
	new URL('../prisma/nutrition-data/nutrition-data.sql', import.meta.url),
	'utf8'
);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
await pool.query(sql);
await pool.end();
console.log('NutritionData table is up to date');
