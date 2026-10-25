import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { gzipSync } from 'node:zlib';
import { prepareDownload } from './utils/download.ts';

test('cache replacement requires a complete gzip and leaves the previous file on failure', async () => {
	const directory = await mkdtemp(path.join(tmpdir(), 'nutrition-download-'));
	const dest = path.join(directory, 'products.csv.gz');
	const original = gzipSync('old data');
	const replacement = gzipSync('new data');
	const server = createServer((request, response) => {
		if (request.url === '/missing') {
			response.writeHead(404).end();
		} else if (request.url === '/truncated') {
			response.end(replacement.subarray(0, replacement.length - 5));
		} else if (request.url === '/redirect') {
			response.writeHead(302, { location: '/valid' }).end();
		} else {
			response.end(replacement);
		}
	});
	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
	const address = server.address();
	assert.ok(address && typeof address !== 'string');
	const url = `http://127.0.0.1:${address.port}`;
	try {
		await writeFile(dest, original);
		// A usable cache needs no network, even when the source is unavailable.
		await prepareDownload(`${url}/missing`, dest);
		assert.deepEqual(await readFile(dest), original);
		for (const endpoint of ['/missing', '/truncated']) {
			await assert.rejects(prepareDownload(`${url}${endpoint}`, dest, true));
			assert.deepEqual(await readFile(dest), original);
			assert.deepEqual(await readdir(directory), ['products.csv.gz']);
		}
		await prepareDownload(`${url}/redirect`, dest, true);
		assert.deepEqual(await readFile(dest), replacement);
		// Recover a cache left by the old downloader instead of reusing bad bytes forever.
		await writeFile(dest, replacement.subarray(0, 10));
		await prepareDownload(`${url}/valid`, dest);
		assert.deepEqual(await readFile(dest), replacement);
	} finally {
		await new Promise<void>((resolve, reject) =>
			server.close((error) => (error ? reject(error) : resolve()))
		);
		await rm(directory, { recursive: true, force: true });
	}
});
