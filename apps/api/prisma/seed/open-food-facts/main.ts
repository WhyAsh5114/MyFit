/// <reference types="bun" />

import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createGunzip } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import { parse } from 'csv-parse';
import { Client } from 'pg';
import copyFrom from 'pg-copy-streams';
import chalk from 'chalk';

import type { RawNutritionData } from './utils/types.ts';
import { mapRawToProcessed, toTsvRow } from './utils/mappers.ts';
import { isValidRecord, sanitizeRecord } from './utils/filtration.ts';
import {
	CREATE_STAGING_TABLE_SQL,
	INSERT_INTO_NUTRITION_DATA_SQL,
	COPY_INTO_STAGING_SQL
} from './utils/staging-schema.ts';
import {
	logSuccess,
	logWarning,
	logInfo,
	logError,
	logProgressWithETA,
	logBanner,
	logSuccessBanner
} from './utils/logging.ts';

import { prepareDownload } from './utils/download.ts';

const { from } = copyFrom;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.OFF_DATA_DIR ?? path.join(__dirname, 'data');
const GZ_PATH = path.join(DATA_DIR, 'products.csv.gz');
const CSV_URL = 'https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz';

/**
 * Parse row limit from environment or command line
 * Usage: ROW_LIMIT=100000 npm run seed   (process first 100k rows)
 *        or node main.ts 100000 (process first 100k rows)
 * Default: undefined (no limit, process all)
 */
function parseRowLimit(): number | undefined {
	// Check environment variable first
	if (process.env.ROW_LIMIT) {
		const limit = parseInt(process.env.ROW_LIMIT, 10);
		if (isFinite(limit) && limit > 0) {
			return limit;
		}
	}

	// Check command line argument
	if (process.argv.length > 2) {
		const limit = parseInt(process.argv[2], 10);
		if (isFinite(limit) && limit > 0) {
			return limit;
		}
	}

	return undefined; // Default: no limit
}

/** Create the download cache directory before writing files. */
function ensureDir() {
	if (!fs.existsSync(DATA_DIR)) {
		logInfo(`Creating data directory at ${DATA_DIR}`);
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}
}

/** Validate and stream the cached export into the transaction-local staging table. */
async function copyCsvToStaging(client: Client, rowLimit: number | undefined) {
	logInfo('Starting CSV import with validation and unit conversion...');
	console.log();

	const startTime = Date.now();
	const fileSize = fs.statSync(GZ_PATH).size;
	let bytesRead = 0;

	const copy = client.query(from(COPY_INTO_STAGING_SQL));

	const csv = parse({
		columns: true,
		delimiter: '\t',
		relax_quotes: true,
		relax_column_count: true
	});

	let processedRows = 0;
	let validRows = 0;
	let skippedRows = 0;

	const fileStream = fs.createReadStream(GZ_PATH);
	fileStream.on('data', (chunk) => {
		bytesRead += chunk.length;
	});

	/** Map valid rows while allowing stream failures to reach the transaction. */
	const transform = async function* (src: AsyncIterable<RawNutritionData>) {
		for await (const raw of src) {
			processedRows++;
			let sanitized;
			try {
				sanitized = sanitizeRecord(mapRawToProcessed(raw));
			} catch {
				skippedRows++;
				continue;
			}
			if (!isValidRecord(sanitized)) {
				skippedRows++;
				continue;
			}

			validRows++;
			yield toTsvRow(sanitized);
			if (rowLimit && validRows >= rowLimit) return;

			if (validRows % 10_000 === 0) {
				const elapsed = (Date.now() - startTime) / 1000;
				const speed = bytesRead / 1024 / 1024 / elapsed;
				const remainingBytes = fileSize - bytesRead;
				const remainingSeconds = speed > 0 ? remainingBytes / 1024 / 1024 / speed : 0;
				logProgressWithETA(validRows, bytesRead, fileSize, speed.toFixed(2), remainingSeconds);
			}
		}
	};

	// Keep COPY outside the input pipeline so reaching ROW_LIMIT finishes COPY
	// normally instead of aborting the database transaction with the input streams.
	await Promise.all([
		pipeline(fileStream, createGunzip(), csv).catch((error: NodeJS.ErrnoException) => {
			if (!(rowLimit && validRows >= rowLimit && error.code === 'ABORT_ERR')) throw error;
		}),
		pipeline(transform(csv), copy)
	]);

	logSuccess(
		'CSV import complete: ' +
			validRows.toLocaleString() +
			' valid rows | ' +
			skippedRows.toLocaleString() +
			' skipped'
	);

	return { processedRows, validRows };
}

/** Import validated OFF rows atomically and refresh planner statistics. */
async function main() {
	const rowLimit = parseRowLimit();

	logBanner('Open Food Facts Database Importer');

	if (rowLimit) {
		logWarning(`Row limit mode: processing first ${rowLimit.toLocaleString()} rows`);
		console.log();
	}

	const client = new Client({ connectionString: process.env.DATABASE_URL });
	let inTransaction = false;

	logInfo('Connecting to database...');
	await client.connect();
	logSuccess('Database connected');

	try {
		// Deploys populate a fresh database once; explicit imports always refresh it.
		if (process.env.SEED_IF_EMPTY === '1') {
			const { rows } = await client.query(
				'SELECT EXISTS (SELECT 1 FROM "NutritionData") AS populated'
			);
			if (rows[0].populated) {
				logInfo('NutritionData is already populated, skipping deploy seed');
				return;
			}
		}

		ensureDir();
		await prepareDownload(CSV_URL, GZ_PATH, process.env.REFRESH_OFF_DATA === '1');
		logInfo('Starting transaction...');
		await client.query('BEGIN');
		inTransaction = true;
		logInfo('Creating temporary staging table...');
		await client.query(CREATE_STAGING_TABLE_SQL);
		logSuccess('Staging table ready');

		const { processedRows, validRows } = await copyCsvToStaging(client, rowLimit);

		logInfo('Inserting data into NutritionData table...');
		const resultInsert = await client.query(INSERT_INTO_NUTRITION_DATA_SQL);
		logSuccess(`Upserted ${resultInsert.rowCount} records into NutritionData`);

		await client.query('COMMIT');
		inTransaction = false;
		logSuccess('Transaction committed');
		await client.query('ANALYZE "NutritionData"');
		logSuccess('Planner statistics updated');

		logSuccessBanner('Import Successful! ✓');
		console.log();
		console.log(
			chalk.gray(
				`Summary: Processed ${processedRows.toLocaleString()} records, imported ${validRows.toLocaleString()}`
			)
		);
		console.log();
	} catch (error) {
		if (inTransaction) {
			logError('Import failed, rolling back transaction...');
			await client.query('ROLLBACK');
			logSuccess('Transaction rolled back');
		}
		throw error;
	} finally {
		await client.end();
		logSuccess('Database connection closed');
	}
}

main().catch((err) => {
	console.log();
	logError('Script failed with error:');
	console.error(err);
	process.exit(1);
});
