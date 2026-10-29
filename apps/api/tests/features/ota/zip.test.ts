import { expect, test } from 'vitest';
import { readZipEntryNames } from '../../../src/features/ota/zip.js';
import { buildZip } from './zip-fixture.js';

test('lists entry names, including when the archive has a trailing comment', () => {
	const zip = buildZip({ 'index.html': '<html>', '_app/main.js': 'x' }, 'built by ci');

	expect(readZipEntryNames(zip)).toEqual(['index.html', '_app/main.js']);
});

test('rejects bytes that are not a zip archive', () => {
	expect(readZipEntryNames(Buffer.from('definitely not a zip'))).toBe(null);
	expect(readZipEntryNames(Buffer.alloc(0))).toBe(null);
});

test('rejects an archive whose central directory is cut off', () => {
	const zip = buildZip({ 'index.html': '<html>' });
	const end = zip.subarray(zip.length - 22);
	const truncated = Buffer.concat([zip.subarray(0, 10), end]);

	expect(readZipEntryNames(truncated)).toBe(null);
});

/** Offset of the central directory in a comment-free archive from `buildZip`. */
function directoryOffset(zip: Buffer): number {
	return zip.readUInt32LE(zip.length - 22 + 16);
}

test('rejects an archive that keeps its central directory but lost the files', () => {
	const zip = buildZip({ 'index.html': '<html>' });
	const directoryOnly = Buffer.from(zip.subarray(directoryOffset(zip)));
	directoryOnly.writeUInt32LE(0, directoryOnly.length - 22 + 16);

	expect(readZipEntryNames(directoryOnly)).toBe(null);
});

test('rejects a directory entry whose extra field runs past the end of the file', () => {
	const zip = buildZip({ 'index.html': '<html>' });
	zip.writeUInt16LE(0xffff, directoryOffset(zip) + 30);

	expect(readZipEntryNames(zip)).toBe(null);
});

test('rejects an entry whose data is cut off before the central directory', () => {
	const zip = buildZip({ 'index.html': '<html>' });
	zip.writeUInt32LE(1000, directoryOffset(zip) + 20);

	expect(readZipEntryNames(zip)).toBe(null);
});

test('rejects an entry whose local header names a different file', () => {
	const zip = buildZip({ 'index.html': '<html>' });
	zip.write('other.html', 30);

	expect(readZipEntryNames(zip)).toBe(null);
});

test('ignores an end-record signature inside the trailing comment', () => {
	const fakeEnd = Buffer.alloc(22);
	fakeEnd.writeUInt32LE(0x06054b50, 0);
	const fake = fakeEnd.toString('latin1');

	for (const comment of [`${fake} padding`, fake]) {
		const zip = buildZip({ 'index.html': '<html>' }, comment);
		expect(readZipEntryNames(zip)).toEqual(['index.html']);
	}
});
