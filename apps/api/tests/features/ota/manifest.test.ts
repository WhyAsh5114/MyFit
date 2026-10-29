import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, expect, test } from 'vitest';
import {
	findBundle,
	latestInChannel,
	readManifest,
	writeFileAtomic,
	writeManifest,
	type Manifest
} from '../../../src/features/ota/manifest.js';

let dir: string;

beforeAll(async () => {
	dir = await mkdtemp(join(tmpdir(), 'ota-manifest-'));
});

afterAll(async () => {
	await rm(dir, { recursive: true, force: true });
});

const manifest: Manifest = {
	bundles: {
		'1': {
			version: '1',
			filename: '1.zip',
			checksum: 'abc',
			createdAt: '2026-01-01T00:00:00.000Z',
			channel: 'cap8'
		}
	}
};

test('a missing manifest reads as empty', async () => {
	expect(await readManifest(join(dir, 'not-created-yet'))).toEqual({ bundles: {} });
});

test('a written manifest reads back and leaves no temporary file behind', async () => {
	await writeManifest(dir, manifest);

	expect(await readManifest(dir)).toEqual(manifest);
	expect(await readdir(dir)).toEqual(['manifest.json']);
});

test('a corrupt manifest throws instead of reading as empty', async () => {
	await writeFile(join(dir, 'manifest.json'), '{"bundles": {"1": ');

	await expect(readManifest(dir)).rejects.toBeInstanceOf(SyntaxError);
});

test('a manifest that cannot be read for another reason than being missing throws', async () => {
	const unreadable = join(dir, 'unreadable');
	await mkdir(join(unreadable, 'manifest.json'), { recursive: true });

	await expect(readManifest(unreadable)).rejects.toMatchObject({ code: 'EISDIR' });
});

test('finds uploaded versions only, never inherited object properties', () => {
	expect(findBundle(manifest, '1')).toEqual(manifest.bundles['1']);
	expect(findBundle(manifest, '2')).toBe(undefined);
	expect(findBundle(manifest, 'constructor')).toBe(undefined);
	expect(findBundle(manifest, '__proto__')).toBe(undefined);
});

test('an atomic write replaces the file and leaves no temporary file behind', async () => {
	const target = join(dir, 'bundle.zip');
	await writeFileAtomic(target, Buffer.from('first'));
	await writeFileAtomic(target, Buffer.from('second'));

	expect(await readFile(target, 'utf-8')).toBe('second');
	expect((await readdir(dir)).filter((name) => name.endsWith('.tmp'))).toEqual([]);
});

test('the latest bundle is the newest one in the channel, and a channel without bundles has none', () => {
	const entry = (version: string, createdAt: string, channel: string) => ({
		version,
		filename: `${version}.zip`,
		checksum: 'abc',
		createdAt,
		channel
	});
	const mixed: Manifest = {
		bundles: {
			a1: entry('a1', '2026-01-01T00:00:00.000Z', 'cap8'),
			a2: entry('a2', '2026-01-03T00:00:00.000Z', 'cap8'),
			b1: entry('b1', '2026-01-05T00:00:00.000Z', 'cap9')
		}
	};

	expect(latestInChannel(mixed, 'cap8')?.version).toBe('a2');
	expect(latestInChannel(mixed, 'cap9')?.version).toBe('b1');
	expect(latestInChannel(mixed, 'cap7')).toBe(undefined);
});
