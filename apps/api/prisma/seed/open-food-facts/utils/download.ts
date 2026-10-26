import { randomUUID } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { access, rename, rm } from 'node:fs/promises';
import { Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createGunzip } from 'node:zlib';
import { logInfo, logWarning } from './logging.ts';

/** Read the whole gzip so truncated responses never become reusable cache files. */
async function validateGzip(file: string): Promise<void> {
	await pipeline(
		createReadStream(file),
		createGunzip(),
		new Writable({
			write(_chunk, _encoding, callback) {
				callback();
			}
		})
	);
}

/** Reuse a valid cache, or replace it atomically after a complete, valid download. */
export async function prepareDownload(url: string, dest: string, refresh = false): Promise<void> {
	if (!refresh) {
		try {
			await access(dest);
			await validateGzip(dest);
			logInfo('Using validated cached CSV');
			return;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
				logWarning('Cached CSV is unreadable or corrupt, downloading a replacement');
			}
		}
	}

	// Separate temporary files also keep overlapping downloads from sharing a writer.
	const part = `${dest}.${randomUUID()}.part`;
	try {
		logInfo('Downloading Open Food Facts CSV...');
		const response = await fetch(url);
		if (!response.ok || !response.body) {
			await response.body?.cancel();
			throw new Error(`Download failed: ${response.status}`);
		}
		await pipeline(response.body, createWriteStream(part));
		await validateGzip(part);
		await rename(part, dest);
	} finally {
		await rm(part, { force: true });
	}
}
