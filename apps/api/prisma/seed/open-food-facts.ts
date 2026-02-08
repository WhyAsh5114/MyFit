/// <reference types="node" />

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

const { from } = copyFrom;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const GZ_PATH = path.join(DATA_DIR, 'products.csv.gz');
const CSV_URL = 'https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz';

type RawNutritionData = {
	code: string;
	product_name: string;
	brands: string;
	'energy-kcal_100g': string;
	proteins_100g: string;
	fat_100g: string;
	carbohydrates_100g: string;
	'saturated-fat_100g': string;
	'unsaturated-fat_100g': string;
	'monounsaturated-fat_100g': string;
	'polyunsaturated-fat_100g': string;
	'trans-fat_100g': string;
	cholesterol_100g: string;
	sugars_100g: string;
	polyols_100g: string;
	fiber_100g: string;
	salt_100g: string;
	sodium_100g: string;
	alcohol_100g: string;
	'vitamin-a_100g': string;
	'vitamin-d_100g': string;
	'vitamin-e_100g': string;
	'vitamin-k_100g': string;
	'vitamin-c_100g': string;
	'vitamin-b1_100g': string;
	'vitamin-b2_100g': string;
	'vitamin-b6_100g': string;
	'vitamin-b9_100g': string;
	folates_100g: string;
	'vitamin-b12_100g': string;
	potassium_100g: string;
	calcium_100g: string;
	phosphorus_100g: string;
	iron_100g: string;
	magnesium_100g: string;
	zinc_100g: string;
	copper_100g: string;
	manganese_100g: string;
	caffeine_100g: string;
};

function log(message: string) {
	const timestamp = new Date().toLocaleTimeString();
	console.log(`${chalk.bold.gray(`[${timestamp}`)}${chalk.gray(`]`)} ${message}`);
}

function logSuccess(message: string) {
	log(chalk.green(`✓ ${message}`));
}

function logWarning(message: string) {
	log(chalk.yellow(`⚠ ${message}`));
}

function logInfo(message: string) {
	log(chalk.cyan(`ℹ ${message}`));
}

function logError(message: string) {
	log(chalk.red(`✗ ${message}`));
}

function logProgressWithETA(
	rows: number,
	bytesRead: number,
	totalBytes: number,
	speedMBps: string,
	remainingSeconds: number
) {
	const percentage = ((bytesRead / totalBytes) * 100).toFixed(1);
	const formatted = `◇ Copied ${rows.toLocaleString()} rows | ${percentage}% | Speed: ${speedMBps} MB/s | ETA: ${formatSeconds(remainingSeconds)}`;
	process.stdout.write(`\r${chalk.blue(formatted)}${chalk.dim('                    ')}`);
}

function logDownloadProgress(current: number, total: number, speed: string) {
	const percentage = total > 0 ? ((current / total) * 100).toFixed(1) : '0.0';
	const remaining = Math.max(0, total - current);
	const speedMBps = parseFloat(speed);
	const remainingSeconds = speedMBps > 0 ? remaining / 1024 / 1024 / speedMBps : 0;
	const remainingTime = formatSeconds(remainingSeconds);
	const formatted = `⬇ Downloaded ${(current / 1024 / 1024).toFixed(2)} MB / ${(total / 1024 / 1024).toFixed(2)} MB (${percentage}%) | Speed: ${speed} | ETA: ${remainingTime}`;
	process.stdout.write(`\r${chalk.blue(formatted)}${chalk.dim('                    ')}`);
}

function formatSeconds(seconds: number): string {
	if (seconds < 60) return `${Math.round(seconds)}s`;
	if (seconds < 3600) {
		const mins = Math.floor(seconds / 60);
		const secs = Math.round(seconds % 60);
		return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
	}
	const hours = Math.floor(seconds / 3600);
	const mins = Math.round((seconds % 3600) / 60);
	return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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

function num(v?: string) {
	if (!v || v === '') return '\\N';
	const n = Number(v);
	return Number.isFinite(n) ? n.toString() : '\\N';
}

function escapeText(v?: string) {
	if (!v || v === '') return '\\N';
	// Escape special characters for PostgreSQL TEXT format
	return v
		.replace(/\\/g, '\\\\') // Backslash
		.replace(/\n/g, '\\n') // Newline
		.replace(/\r/g, '\\r') // Carriage return
		.replace(/\t/g, '\\t'); // Tab
}

async function main() {
	console.log();
	console.log(chalk.cyan.bold('╔════════════════════════════════════════╗'));
	console.log(chalk.cyan.bold('║   Open Food Facts Database Importer    ║'));
	console.log(chalk.cyan.bold('╚════════════════════════════════════════╝'));
	console.log();

	ensureDir();

	if (!fs.existsSync(GZ_PATH)) {
		await download(CSV_URL, GZ_PATH);
	} else {
		logWarning('CSV already downloaded, skipping download step');
	}

	const client = new Client({
		connectionString: process.env.DATABASE_URL
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
		await client.query(`
      CREATE TABLE IF NOT EXISTS nutrition_data_staging (
        code TEXT,
        product_name TEXT,
        brands TEXT,
        energy_kcal_100g DOUBLE PRECISION,
        proteins_100g DOUBLE PRECISION,
        fat_100g DOUBLE PRECISION,
        carbohydrates_100g DOUBLE PRECISION,
        saturated_fat_100g DOUBLE PRECISION,
        unsaturated_fat_100g DOUBLE PRECISION,
        monounsaturated_fat_100g DOUBLE PRECISION,
        polyunsaturated_fat_100g DOUBLE PRECISION,
        trans_fat_100g DOUBLE PRECISION,
        cholesterol_100g DOUBLE PRECISION,
        sugars_100g DOUBLE PRECISION,
        polyols_100g DOUBLE PRECISION,
        fiber_100g DOUBLE PRECISION,
        salt_100g DOUBLE PRECISION,
        sodium_100g DOUBLE PRECISION,
        alcohol_100g DOUBLE PRECISION,
        vitamin_a_100g DOUBLE PRECISION,
        vitamin_d_100g DOUBLE PRECISION,
        vitamin_e_100g DOUBLE PRECISION,
        vitamin_k_100g DOUBLE PRECISION,
        vitamin_c_100g DOUBLE PRECISION,
        vitamin_b1_100g DOUBLE PRECISION,
        vitamin_b2_100g DOUBLE PRECISION,
        vitamin_b6_100g DOUBLE PRECISION,
        vitamin_b9_100g DOUBLE PRECISION,
        folates_100g DOUBLE PRECISION,
        vitamin_b12_100g DOUBLE PRECISION,
        potassium_100g DOUBLE PRECISION,
        calcium_100g DOUBLE PRECISION,
        phosphorus_100g DOUBLE PRECISION,
        iron_100g DOUBLE PRECISION,
        magnesium_100g DOUBLE PRECISION,
        zinc_100g DOUBLE PRECISION,
        copper_100g DOUBLE PRECISION,
        manganese_100g DOUBLE PRECISION,
        caffeine_100g DOUBLE PRECISION
      )
    `);
		logSuccess('Staging table ready');

		logInfo('Truncating staging table...');
		await client.query('TRUNCATE nutrition_data_staging');
		logSuccess('Staging table truncated');

		logInfo('Starting CSV import...');
		console.log();

		const startTime = Date.now();
		const fileSize = fs.statSync(GZ_PATH).size;
		let bytesRead = 0;

		const copy = client.query(
			from(`
    COPY nutrition_data_staging (
      code,
      product_name,
      brands,
      energy_kcal_100g,
      proteins_100g,
      fat_100g,
      carbohydrates_100g,
      saturated_fat_100g,
      unsaturated_fat_100g,
      monounsaturated_fat_100g,
      polyunsaturated_fat_100g,
      trans_fat_100g,
      cholesterol_100g,
      sugars_100g,
      polyols_100g,
      fiber_100g,
      salt_100g,
      sodium_100g,
      alcohol_100g,
      vitamin_a_100g,
      vitamin_d_100g,
      vitamin_e_100g,
      vitamin_k_100g,
      vitamin_c_100g,
      vitamin_b1_100g,
      vitamin_b2_100g,
      vitamin_b6_100g,
      vitamin_b9_100g,
      folates_100g,
      vitamin_b12_100g,
      potassium_100g,
      calcium_100g,
      phosphorus_100g,
      iron_100g,
      magnesium_100g,
      zinc_100g,
      copper_100g,
      manganese_100g,
      caffeine_100g
    )
    FROM STDIN WITH (FORMAT text, NULL '\\N')
  `)
		);

		const csv = parse({
			columns: true,
			delimiter: '\t',
			relax_quotes: true,
			relax_column_count: true
		});

		let rows = 0;
		const fileStream = fs.createReadStream(GZ_PATH);
		fileStream.on('data', (chunk) => {
			bytesRead += chunk.length;
		});

		const transform = async function* (src: AsyncIterable<RawNutritionData>) {
			for await (const r of src) {
				if (!r.code || !r.product_name) continue;

				const fat = num(r.fat_100g);
				const sat = num(r['saturated-fat_100g']);
				const unsat =
					fat !== '\\N' && sat !== '\\N' ? (Number(fat) - Number(sat)).toString() : '\\N';

				yield [
					escapeText(r.code),
					escapeText(r.product_name),
					escapeText(r.brands),
					num(r['energy-kcal_100g']),
					num(r.proteins_100g),
					fat,
					num(r.carbohydrates_100g),
					sat,
					unsat,
					num(r['monounsaturated-fat_100g']),
					num(r['polyunsaturated-fat_100g']),
					num(r['trans-fat_100g']),
					num(r.cholesterol_100g),
					num(r.sugars_100g),
					num(r.polyols_100g),
					num(r.fiber_100g),
					num(r.salt_100g),
					num(r.sodium_100g),
					num(r.alcohol_100g),
					num(r['vitamin-a_100g']),
					num(r['vitamin-d_100g']),
					num(r['vitamin-e_100g']),
					num(r['vitamin-k_100g']),
					num(r['vitamin-c_100g']),
					num(r['vitamin-b1_100g']),
					num(r['vitamin-b2_100g']),
					num(r['vitamin-b6_100g']),
					num(r['vitamin-b9_100g']),
					num(r.folates_100g),
					num(r['vitamin-b12_100g']),
					num(r.potassium_100g),
					num(r.calcium_100g),
					num(r.phosphorus_100g),
					num(r.iron_100g),
					num(r.magnesium_100g),
					num(r.zinc_100g),
					num(r.copper_100g),
					num(r.manganese_100g),
					num(r.caffeine_100g)
				].join('\t') + '\n';

				if (++rows % 10_000 === 0) {
					const now = Date.now();
					const elapsed = (now - startTime) / 1000;
					const speed = bytesRead / 1024 / 1024 / elapsed;
					const remainingBytes = fileSize - bytesRead;
					const remainingSeconds = speed > 0 ? remainingBytes / 1024 / 1024 / speed : 0;
					logProgressWithETA(rows, bytesRead, fileSize, speed.toFixed(2), remainingSeconds);
				}
			}
		};

		await pipeline(fileStream, createGunzip(), csv, transform, copy);

		// Clear the progress line
		process.stdout.write('\r' + ' '.repeat(100) + '\r');
		logSuccess(`CSV import complete: ${rows.toLocaleString()} rows copied`);

		logInfo('Inserting data into final table...');
		await client.query(`
      INSERT INTO "NutritionData" (
        code,
        product_name,
        brands,
        energy_kcal_100g,
        proteins_100g,
        fat_100g,
        carbohydrates_100g,
        saturated_fat_100g,
        unsaturated_fat_100g,
        monounsaturated_fat_100g,
        polyunsaturated_fat_100g,
        trans_fat_100g,
        cholesterol_100g,
        sugars_100g,
        polyols_100g,
        fiber_100g,
        salt_100g,
        sodium_100g,
        alcohol_100g,
        vitamin_a_100g,
        vitamin_d_100g,
        vitamin_e_100g,
        vitamin_k_100g,
        vitamin_c_100g,
        vitamin_b1_100g,
        vitamin_b2_100g,
        vitamin_b6_100g,
        vitamin_b9_100g,
        folates_100g,
        vitamin_b12_100g,
        potassium_100g,
        calcium_100g,
        phosphorus_100g,
        iron_100g,
        magnesium_100g,
        zinc_100g,
        copper_100g,
        manganese_100g,
        caffeine_100g
      )
      SELECT DISTINCT ON (code)
        *
      FROM nutrition_data_staging
      WHERE
        code IS NOT NULL
        AND product_name IS NOT NULL
        AND energy_kcal_100g IS NOT NULL
        AND proteins_100g IS NOT NULL
        AND fat_100g IS NOT NULL
        AND carbohydrates_100g IS NOT NULL
      ON CONFLICT (code) DO NOTHING
    `);
		logSuccess('Data inserted into final table');

		logInfo('Cleaning up staging table...');
		await client.query('DROP TABLE IF EXISTS nutrition_data_staging');
		logSuccess('Staging table dropped');

		await client.query('COMMIT');
		logSuccess('Transaction committed');

		console.log();
		console.log(chalk.green.bold('╔════════════════════════════════════════╗'));
		console.log(chalk.green.bold('║         Import Successful! ✓           ║'));
		console.log(chalk.green.bold('╚════════════════════════════════════════╝'));
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
