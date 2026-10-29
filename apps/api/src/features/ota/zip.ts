const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
const CENTRAL_DIRECTORY_ENTRY_SIGNATURE = 0x02014b50;
const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const END_OF_CENTRAL_DIRECTORY_SIZE = 22;
const CENTRAL_DIRECTORY_ENTRY_SIZE = 46;
const LOCAL_FILE_HEADER_SIZE = 30;
const MAX_COMMENT_SIZE = 0xffff;
/** Field value that marks a ZIP64 archive, which bundles never need (they are capped at 50 MB). */
const ZIP64_COUNT = 0xffff;
const ZIP64_SIZE_OR_OFFSET = 0xffffffff;

/** Where the central directory sits in the archive, as the end record declares it. */
interface CentralDirectory {
	entryCount: number;
	offset: number;
	size: number;
}

/**
 * Finds the end-of-central-directory record, which closes the archive before any comment.
 * A comment can contain the record's signature, so a candidate counts only when its comment
 * length reaches exactly the end of the file and its directory ends right where the record starts.
 * The second check rejects a zero-filled fake record, whose empty directory is not adjacent to it.
 * Returns `null` for ZIP64 archives and when no candidate qualifies.
 */
function findCentralDirectory(zip: Buffer): CentralDirectory | null {
	const lowest = Math.max(0, zip.length - END_OF_CENTRAL_DIRECTORY_SIZE - MAX_COMMENT_SIZE);
	for (let end = zip.length - END_OF_CENTRAL_DIRECTORY_SIZE; end >= lowest; end--) {
		if (zip.readUInt32LE(end) !== END_OF_CENTRAL_DIRECTORY_SIGNATURE) continue;

		const commentLength = zip.readUInt16LE(end + 20);
		if (end + END_OF_CENTRAL_DIRECTORY_SIZE + commentLength !== zip.length) continue;

		const entryCount = zip.readUInt16LE(end + 10);
		const size = zip.readUInt32LE(end + 12);
		const offset = zip.readUInt32LE(end + 16);
		if (entryCount === ZIP64_COUNT || size === ZIP64_SIZE_OR_OFFSET) return null;
		if (offset === ZIP64_SIZE_OR_OFFSET) return null;
		if (offset + size !== end) continue;

		return { entryCount, offset, size };
	}
	return null;
}

/**
 * Checks that the local file header an entry points at exists, names the same file, and is followed
 * by all of the entry's data, all before the central directory. Extraction fails otherwise.
 */
function hasLocalEntry(
	zip: Buffer,
	localOffset: number,
	name: string,
	compressedSize: number,
	directoryOffset: number
): boolean {
	if (compressedSize === ZIP64_SIZE_OR_OFFSET || localOffset === ZIP64_SIZE_OR_OFFSET) return false;
	if (localOffset + LOCAL_FILE_HEADER_SIZE > directoryOffset) return false;
	if (zip.readUInt32LE(localOffset) !== LOCAL_FILE_HEADER_SIGNATURE) return false;

	const nameLength = zip.readUInt16LE(localOffset + 26);
	const extraLength = zip.readUInt16LE(localOffset + 28);
	const nameStart = localOffset + LOCAL_FILE_HEADER_SIZE;
	const dataStart = nameStart + nameLength + extraLength;
	if (dataStart + compressedSize > directoryOffset) return false;

	return zip.toString('utf-8', nameStart, nameStart + nameLength) === name;
}

/**
 * Lists the file names in a ZIP archive by reading its central directory.
 * Returns `null` unless the archive is a well-formed, non-ZIP64 archive: every directory entry
 * must lie inside the directory and point at a complete local entry.
 * It does not decompress anything or verify entry contents.
 */
export function readZipEntryNames(zip: Buffer): string[] | null {
	const directory = findCentralDirectory(zip);
	if (!directory) return null;

	const directoryEnd = directory.offset + directory.size;
	const names: string[] = [];
	let offset = directory.offset;
	for (let index = 0; index < directory.entryCount; index++) {
		if (offset + CENTRAL_DIRECTORY_ENTRY_SIZE > directoryEnd) return null;
		if (zip.readUInt32LE(offset) !== CENTRAL_DIRECTORY_ENTRY_SIGNATURE) return null;

		const compressedSize = zip.readUInt32LE(offset + 20);
		const nameLength = zip.readUInt16LE(offset + 28);
		const extraLength = zip.readUInt16LE(offset + 30);
		const commentLength = zip.readUInt16LE(offset + 32);
		const localOffset = zip.readUInt32LE(offset + 42);
		const nameStart = offset + CENTRAL_DIRECTORY_ENTRY_SIZE;
		const next = nameStart + nameLength + extraLength + commentLength;
		if (next > directoryEnd) return null;

		const name = zip.toString('utf-8', nameStart, nameStart + nameLength);
		if (!hasLocalEntry(zip, localOffset, name, compressedSize, directory.offset)) return null;

		names.push(name);
		offset = next;
	}
	return names;
}
