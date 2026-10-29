import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest';
import { buildZip } from './zip-fixture.js';

const UPLOAD_KEY = 'test-publisher-key';

let dir: string;
let otaRoutes: (typeof import('../../../src/features/ota/routes.js'))['otaRoutes'];

beforeAll(async () => {
	dir = await mkdtemp(join(tmpdir(), 'ota-routes-'));
	// The routes read their configuration when the module loads, so set it first.
	Object.assign(process.env, {
		DATABASE_URL: 'postgres://unused',
		TRUSTED_ORIGINS: '[]',
		BETTER_AUTH_SECRET: 'unused',
		BETTER_AUTH_URL: 'http://localhost',
		OTA_BUNDLES_DIR: dir,
		OTA_UPLOAD_KEY: UPLOAD_KEY
	});
	({ otaRoutes } = await import('../../../src/features/ota/routes.js'));
});

// Every case starts from an empty bundle store, so cases do not depend on each other's uploads.
beforeEach(async () => {
	await rm(dir, { recursive: true, force: true });
});

afterAll(async () => {
	await rm(dir, { recursive: true, force: true });
});

/** Posts a bundle to `/upload` with the publisher key. */
function upload(fields: { file?: Buffer; version?: string; channel?: string }) {
	const form = new FormData();
	if (fields.file) form.set('file', new File([new Uint8Array(fields.file)], 'bundle.zip'));
	if (fields.version !== undefined) form.set('version', fields.version);
	form.set('channel', fields.channel ?? 'cap8');
	return otaRoutes.request('/upload', {
		method: 'POST',
		headers: { Authorization: `Bearer ${UPLOAD_KEY}` },
		body: form
	});
}

/** Asks `/latest` as a client whose current bundle was built for `channel`. */
async function latestFor(channel = 'cap8'): Promise<{ version?: string; upToDate: boolean }> {
	return (await otaRoutes.request(`/latest?channel=${channel}`)).json() as Promise<{
		version?: string;
		upToDate: boolean;
	}>;
}

const validBundle = buildZip({ 'index.html': '<html>' });

test('rejects uploads without the publisher key', async () => {
	const response = await otaRoutes.request('/upload', { method: 'POST', body: new FormData() });

	expect(response.status).toBe(401);
});

test('rejects bytes that are not a zip, and zips without a root index.html', async () => {
	const notZip = await upload({ file: Buffer.from('not a zip'), version: 'bad-1' });
	const nested = await upload({
		file: buildZip({ 'site/index.html': '<html>' }),
		version: 'bad-2'
	});

	expect(notZip.status).toBe(400);
	expect(nested.status).toBe(400);
	expect(await latestFor()).toEqual({ upToDate: true });
});

test('rejects a zip whose files are missing, so it never becomes the latest bundle', async () => {
	const full = buildZip({ 'index.html': '<html>' });
	const directoryOnly = Buffer.from(full.subarray(full.readUInt32LE(full.length - 22 + 16)));
	directoryOnly.writeUInt32LE(0, directoryOnly.length - 22 + 16);

	const response = await upload({ file: directoryOnly, version: 'bad-3' });

	expect(response.status).toBe(400);
	expect(await latestFor()).toEqual({ upToDate: true });
});

test('rejects an upload without a valid channel', async () => {
	const missing = new FormData();
	missing.set('file', new File([new Uint8Array(validBundle)], 'bundle.zip'));
	const noChannel = await otaRoutes.request('/upload', {
		method: 'POST',
		headers: { Authorization: `Bearer ${UPLOAD_KEY}` },
		body: missing
	});
	const malformed = await upload({ file: validBundle, version: 'bad-4', channel: 'Cap 8' });

	expect(noChannel.status).toBe(400);
	expect(malformed.status).toBe(400);
});

test('serves an uploaded bundle and refuses to overwrite its version', async () => {
	const created = await upload({ file: validBundle, version: 'v1' });
	const duplicate = await upload({ file: validBundle, version: 'v1' });
	const latest = await latestFor();
	const download = await otaRoutes.request('/download/v1');

	expect(created.status).toBe(201);
	expect(duplicate.status).toBe(409);
	expect(latest.version).toBe('v1');
	expect(download.status).toBe(200);
	expect(Number(download.headers.get('Content-Length'))).toBe(validBundle.length);
	expect(Buffer.from(await download.arrayBuffer())).toEqual(validBundle);
});

test('generates a version when the version field is empty', async () => {
	const created = await upload({ file: validBundle, version: '' });
	const { version } = (await created.json()) as { version: string };
	const latest = await latestFor();

	expect(created.status).toBe(201);
	expect(version).toMatch(/^\d{8}-\d{6}-\d{3}$/);
	expect(latest.version).toBe(version);
});

test('serves each channel only its own newest bundle', async () => {
	await upload({ file: validBundle, version: 'a1', channel: 'cap8' });
	await upload({ file: validBundle, version: 'b1', channel: 'cap9' });
	await upload({ file: validBundle, version: 'a2', channel: 'cap8' });

	expect((await latestFor('cap8')).version).toBe('a2');
	expect((await latestFor('cap9')).version).toBe('b1');
	expect(await latestFor('cap7')).toEqual({ upToDate: true });
});

test('requires the client to name its channel', async () => {
	await upload({ file: validBundle, version: 'v1' });

	expect((await otaRoutes.request('/latest')).status).toBe(400);
	expect((await otaRoutes.request('/latest?channel=Cap%208')).status).toBe(400);
});

test('rejects the reserved version name instead of publishing an unreachable latest', async () => {
	await upload({ file: validBundle, version: 'good' });

	const response = await upload({ file: validBundle, version: '__proto__' });

	expect(response.status).toBe(400);
	expect((await latestFor()).version).toBe('good');
});

test('does not serve inherited names as bundles', async () => {
	const response = await otaRoutes.request('/download/constructor');

	expect(response.status).toBe(404);
});
