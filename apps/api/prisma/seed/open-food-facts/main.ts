/// <reference types="bun" />

import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createGunzip } from 'node:zlib';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import { parse } from 'csv-parse';
import { Client } from 'pg';
import copyFrom from 'pg-copy-streams';
import chalk from 'chalk';

import type { RawNutritionData } from './utils/types.js';
import { mapRawToProcessed, toTsvRow } from './utils/mappers.js';
import { isValidRecord, sanitizeRecord } from './utils/filtration.js';
import {
	CREATE_STAGING_TABLE_SQL,
	TRUNCATE_STAGING_TABLE_SQL,
	DROP_STAGING_TABLE_SQL,
	INSERT_INTO_NUTRITION_DATA_SQL,
	COPY_INTO_STAGING_SQL
} from './utils/staging-schema.js';
import {
	logSuccess,
	logWarning,
	logInfo,
	logError,
	logProgressWithETA,
	logDownloadProgress,
	logBanner,
	logSuccessBanner
} from './utils/logging.js';

const { from } = copyFrom;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
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

function ensureDir() {
	if (!fs.existsSync(DATA_DIR)) {
		logInfo(`Creating data directory at ${DATA_DIR}`);
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}
}

function download(url: string, dest: string, maxRedirects: number = 5): Promise<void> {
	return new Promise((resolve, reject) => {
		if (maxRedirects <= 0) {
			reject(new Error('Too many redirects'));
			return;
		}

		logInfo('Starting download...');
		const file = fs.createWriteStream(dest);
		https
			.get(url, (res) => {
				// Handle redirects (301, 302, 303, 307, 308)
				if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode)) {
					const redirectUrl = res.headers.location;
					if (!redirectUrl) {
						reject(new Error(`Redirect without location header`));
						return;
					}
					logInfo(`Following redirect to ${redirectUrl}`);
					file.destroy();
					// Recursively call download with the new URL
					download(redirectUrl, dest, maxRedirects - 1)
						.then(resolve)
						.catch(reject);
					return;
				}

				if (res.statusCode !== 200) {
					reject(new Error(`Download failed: ${res.statusCode}`));
					return;
				}

				const totalSize = parseInt(res.headers['content-length'] || '0', 10);
				logInfo(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

				let downloadedSize = 0;
				let lastUpdate = Date.now();
				let lastSize = 0;

				res.on('data', (chunk) => {
					downloadedSize += chunk.length;
					const now = Date.now();
					const timeDiff = (now - lastUpdate) / 1000;

					// Update progress every 500ms
					if (timeDiff >= 0.5) {
						const sizeDiff = downloadedSize - lastSize;
						const speed = (sizeDiff / 1024 / 1024 / timeDiff).toFixed(2);
						logDownloadProgress(downloadedSize, totalSize, `${speed} MB/s`);
						lastUpdate = now;
						lastSize = downloadedSize;
					}
				});

				res.pipe(file);
				file.on('finish', () => {
					file.close(() => {
						// Clear the progress line
						process.stdout.write('\r' + ' '.repeat(100) + '\r');
						logSuccess('Download complete');
						resolve();
					});
				});
			})
			.on('error', reject);
	});
}

async function main() {
	const rowLimit = parseRowLimit();

	logBanner('Open Food Facts Database Importer');

	if (rowLimit) {
		logWarning(`Row limit mode: processing first ${rowLimit.toLocaleString()} rows`);
		console.log();
	}

	ensureDir();

	if (!fs.existsSync(GZ_PATH)) {
		await download(CSV_URL, GZ_PATH);
	} else {
		logWarning('CSV already downloaded, skipping download step');
	}

	const client = new Client({
		connectionString: process.env.DATABASE_URL,
		ssl: false
	});

	logInfo('Connecting to database...');
	await client.connect();
	logSuccess('Database connected');

	console.log();
	logInfo('Starting transaction...');
	await client.query('BEGIN');
	logSuccess('Transaction started');

	try {
		logInfo('Creating staging table if not exists...');
		await client.query(CREATE_STAGING_TABLE_SQL);
		logSuccess('Staging table ready');

		logInfo('Truncating staging table...');
		await client.query(TRUNCATE_STAGING_TABLE_SQL);
		logSuccess('Staging table truncated');

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

		const transform = async function* (src: AsyncIterable<RawNutritionData>) {
			for await (const raw of src) {
				try {
					// Map raw data to processed format with unit conversion
					const processed = mapRawToProcessed(raw);
					processedRows++;

					// Sanitize the record
					const sanitized = sanitizeRecord(processed);

					// Validate against filtration criteria
					if (!isValidRecord(sanitized)) {
						skippedRows++;
						continue;
					}

					validRows++;
					yield toTsvRow(sanitized);

					// Check if we've reached the row limit after successfully yielding
					if (rowLimit && validRows >= rowLimit) {
						// Destroy input streams to stop processing
						fileStream.destroy();
						return;
					}

					if (validRows % 10_000 === 0) {
						const now = Date.now();
						const elapsed = (now - startTime) / 1000;
						const speed = bytesRead / 1024 / 1024 / elapsed;
						const remainingBytes = fileSize - bytesRead;
						const remainingSeconds = speed > 0 ? remainingBytes / 1024 / 1024 / speed : 0;
						logProgressWithETA(validRows, bytesRead, fileSize, speed.toFixed(2), remainingSeconds);
					}
				} catch (err) {
					// Log and skip records that fail processing
					skippedRows++;
					continue;
				}
			}
		};

		try {
			await pipeline(fileStream, createGunzip(), csv, transform, copy);
		} catch (err: any) {
			// If it's an abort error from our row limit cleanup, it's expected and safe to ignore
			if (
				err.code !== 'ERR_STREAM_DESTROYED' &&
				err.code !== 'ABORT_ERR' &&
				err.code !== 'ERR_STREAM_PREMATURE_CLOSE'
			) {
				throw err;
			}
		}

		logSuccess(
			'CSV import complete: ' +
				validRows.toLocaleString() +
				' valid rows | ' +
				skippedRows.toLocaleString() +
				' skipped'
		);

		logInfo('Inserting data into NutritionData table...');
		const resultInsert = await client.query(INSERT_INTO_NUTRITION_DATA_SQL);
		logSuccess(`Inserted ${resultInsert.rowCount} records into NutritionData`);

		logInfo('Cleaning up staging table...');
		await client.query(DROP_STAGING_TABLE_SQL);
		logSuccess('Staging table dropped');

		await client.query('COMMIT');
		logSuccess('Transaction committed');

		logSuccessBanner('Import Successful! ✓');
		console.log();
		console.log(
			chalk.gray(
				`Summary: Processed ${processedRows.toLocaleString()} records, imported ${validRows.toLocaleString()}`
			)
		);
		console.log();
	} catch (error) {
		console.log('\n');
		logError('An error occurred during import, rolling back transaction...');
		await client.query('ROLLBACK');
		logSuccess('Transaction rolled back');
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
