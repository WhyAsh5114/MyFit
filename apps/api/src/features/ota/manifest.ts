import { mkdir, open, readFile, rename } from 'node:fs/promises';
import { join } from 'node:path';

/** One uploaded bundle. Entries are immutable: a version's file and checksum never change. */
export interface BundleEntry {
	version: string;
	filename: string;
	checksum: string;
	createdAt: string;
	/** The native compatibility line the bundle was built for, such as `cap8`. */
	channel: string;
}

/** What a channel name may look like: lowercase letters, digits and hyphens. */
export const CHANNEL_PATTERN = /^[a-z0-9-]{1,32}$/;

/**
 * Every uploaded bundle by version. Which one clients install is not stored: it is the newest
 * bundle in the client's channel (see `latestInChannel`), so uploading is the only way to change it.
 */
export interface Manifest {
	bundles: Record<string, BundleEntry>;
}

const MANIFEST_FILENAME = 'manifest.json';

/** Returns true when `error` is a Node.js filesystem error with the given code. */
function hasErrorCode(error: unknown, code: string): boolean {
	return error instanceof Error && 'code' in error && error.code === code;
}

/**
 * Looks up an uploaded bundle by version. Only own keys count, so a version such as
 * `constructor` or `__proto__` is unknown rather than resolving to an inherited property.
 */
export function findBundle(manifest: Manifest, version: string): BundleEntry | undefined {
	return Object.hasOwn(manifest.bundles, version) ? manifest.bundles[version] : undefined;
}

/**
 * The bundle clients on `channel` should install: the newest upload in that channel, or
 * `undefined` when it has none. A channel groups bundles that run on the same native app, so a
 * client never receives a bundle built for a different native core.
 */
export function latestInChannel(manifest: Manifest, channel: string): BundleEntry | undefined {
	let latest: BundleEntry | undefined;
	for (const entry of Object.values(manifest.bundles)) {
		if (entry.channel !== channel) continue;
		if (!latest || entry.createdAt >= latest.createdAt) latest = entry;
	}
	return latest;
}

/**
 * Reads the manifest from `dir`. A missing file is a fresh install and yields an empty manifest.
 * Any other failure (unreadable file, corrupt JSON) throws: treating it as empty would hide every
 * published bundle, and the next upload would overwrite the real manifest.
 */
export async function readManifest(dir: string): Promise<Manifest> {
	try {
		return JSON.parse(await readFile(join(dir, MANIFEST_FILENAME), 'utf-8')) as Manifest;
	} catch (error) {
		if (hasErrorCode(error, 'ENOENT')) return { bundles: {} };
		throw error;
	}
}

/**
 * Writes `data` to a temporary file next to `target`, flushes it, then renames it into place.
 * A crash mid-write leaves nothing at `target` or the previous file intact, never a truncated one.
 */
export async function writeFileAtomic(target: string, data: string | Uint8Array): Promise<void> {
	const temporary = `${target}.${process.pid}.tmp`;

	const handle = await open(temporary, 'w');
	try {
		await handle.writeFile(data);
		await handle.sync();
	} finally {
		await handle.close();
	}
	await rename(temporary, target);
}

/** Saves the manifest atomically, so a crash mid-write keeps the previous manifest. */
export async function writeManifest(dir: string, manifest: Manifest): Promise<void> {
	await mkdir(dir, { recursive: true });
	await writeFileAtomic(join(dir, MANIFEST_FILENAME), JSON.stringify(manifest, null, 2));
}
