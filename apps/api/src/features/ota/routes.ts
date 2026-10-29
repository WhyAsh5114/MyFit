import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { mkdir, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import { createHash, timingSafeEqual } from 'node:crypto';
import { join } from 'node:path';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { env } from '../../../lib/env.js';
import {
	CHANNEL_PATTERN,
	findBundle,
	latestInChannel,
	readManifest,
	writeFileAtomic,
	writeManifest,
	type BundleEntry
} from './manifest.js';
import { readZipEntryNames } from './zip.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const OTA_BUNDLES_DIR = env.OTA_BUNDLES_DIR;
const OTA_UPLOAD_KEY = env.OTA_UPLOAD_KEY;
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeSha256(buffer: Buffer): string {
	return createHash('sha256').update(buffer).digest('hex');
}

/** Compares secrets in constant time. Hashing first gives both sides the same length. */
function secretsMatch(provided: string, expected: string): boolean {
	const digest = (value: string) => createHash('sha256').update(value).digest();
	return timingSafeEqual(digest(provided), digest(expected));
}

/** Rejects requests that lack the publisher key. Guards routes that change what clients receive. */
const requirePublisherKey = createMiddleware(async (c, next) => {
	if (!OTA_UPLOAD_KEY) {
		return c.json({ error: 'OTA uploads not configured on this server' }, 501);
	}

	const authHeader = c.req.header('Authorization') ?? '';
	if (!secretsMatch(authHeader, `Bearer ${OTA_UPLOAD_KEY}`)) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	await next();
});

function firstHeaderValue(value: string | undefined): string | undefined {
	return value?.split(',')[0]?.trim() || undefined;
}

function getPublicOrigin(requestUrl: string, header: (name: string) => string | undefined): string {
	if (env.PUBLIC_API_URL) return env.PUBLIC_API_URL;

	const requestOrigin = new URL(requestUrl).origin;
	const host = firstHeaderValue(header('x-forwarded-host')) ?? firstHeaderValue(header('host'));
	if (!host) return requestOrigin;

	const proto =
		firstHeaderValue(header('x-forwarded-proto')) ?? new URL(requestUrl).protocol.replace(':', '');

	return `${proto}://${host}`;
}

// ---------------------------------------------------------------------------
// Manifest lock — prevents concurrent writes from racing on the manifest file.
// Single-process Bun is sufficient; for horizontal scaling, switch to a DB or
// distributed lock.
// ---------------------------------------------------------------------------

let pendingManifestWrite: Promise<void> = Promise.resolve();

/**
 * Waits for earlier manifest writers, then returns the function that releases the lock.
 * The caller must call it in a `finally` block, or every later upload hangs.
 */
async function acquireManifestLock(): Promise<() => void> {
	const prev = pendingManifestWrite;
	let release: () => void;
	pendingManifestWrite = new Promise<void>((resolve) => {
		release = resolve;
	});
	await prev;
	return release!;
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

/** The parsed multipart body of an upload request. */
type UploadForm = Awaited<ReturnType<Request['formData']>>;

/** A bundle that passed validation and is ready to be stored. */
interface ValidBundleUpload {
	buffer: Buffer;
	version: string;
	channel: string;
}

/** Why an upload was refused, with the HTTP status to answer with. */
interface UploadRejection {
	status: 400 | 413;
	error: string;
}

/** Type guard that tells a refused upload from an accepted one. */
function isRejection(result: ValidBundleUpload | UploadRejection): result is UploadRejection {
	return 'error' in result;
}

/** Validates the multipart form of an upload: the file, its zip structure and the optional fields. */
async function validateUploadForm(body: UploadForm): Promise<ValidBundleUpload | UploadRejection> {
	const file = body.get('file');
	if (!file || !(file instanceof File)) {
		return { status: 400, error: 'Missing "file" field in form data' };
	}

	if (file.size > MAX_UPLOAD_BYTES) {
		return { status: 413, error: `Upload exceeds ${MAX_UPLOAD_BYTES / 1024 / 1024} MB limit` };
	}

	const channel = body.get('channel');
	if (typeof channel !== 'string' || !CHANNEL_PATTERN.test(channel)) {
		return {
			status: 400,
			error: '"channel" must be lowercase letters, digits and hyphens, such as cap8'
		};
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	if (!readZipEntryNames(buffer)?.includes('index.html')) {
		return { status: 400, error: 'Bundle must be a zip file with index.html at its root' };
	}

	// An empty field counts as absent: a blank version would publish a bundle with no name.
	const requestedVersion = (body.get('version') as string | null) || generateVersion();
	const version = requestedVersion.replace(/[^a-zA-Z0-9._-]/g, '_');
	// Assigning `bundles['__proto__']` would set the object's prototype instead of adding a bundle.
	if (version === '__proto__') return { status: 400, error: `Version "${version}" is reserved` };
	return { buffer, version, channel };
}

/**
 * Stores a validated bundle, which becomes its channel's latest, under the manifest lock.
 * Returns `null` when the version was already uploaded: versions are immutable.
 */
async function publishBundle(upload: ValidBundleUpload): Promise<BundleEntry | null> {
	const { buffer, version, channel } = upload;

	const release = await acquireManifestLock();
	try {
		const manifest = await readManifest(OTA_BUNDLES_DIR);
		if (findBundle(manifest, version)) return null;

		await mkdir(OTA_BUNDLES_DIR, { recursive: true });
		await writeFileAtomic(join(OTA_BUNDLES_DIR, `${version}.zip`), buffer);

		const entry: BundleEntry = {
			version,
			filename: `${version}.zip`,
			checksum: computeSha256(buffer),
			createdAt: new Date().toISOString(),
			channel
		};
		manifest.bundles[version] = entry;
		await writeManifest(OTA_BUNDLES_DIR, manifest);
		return entry;
	} finally {
		release();
	}
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

const otaRoutes = new Hono()
	/**
	 * GET /api/ota/latest
	 *
	 * Returns the newest bundle in the client's channel. The client compares its version
	 * with `version` via equality — works across any versioning scheme.
	 * The channel names the native core the client's current bundle was built for, so a client
	 * only ever hears about bundles its native app can run.
	 */
	.get(
		'/latest',
		zValidator(
			'query',
			z.object({
				channel: z.string().regex(CHANNEL_PATTERN),
				platform: z.enum(['ios', 'android', 'web']).optional(),
				currentVersion: z.string().optional()
			})
		),
		async (c) => {
			const manifest = await readManifest(OTA_BUNDLES_DIR);

			const latestEntry = latestInChannel(manifest, c.req.valid('query').channel);
			if (!latestEntry) return c.json({ upToDate: true }, 200);

			const origin = getPublicOrigin(c.req.url, (name) => c.req.header(name));
			const downloadUrl = `${origin}/api/ota/download/${encodeURIComponent(latestEntry.version)}`;

			return c.json(
				{
					version: latestEntry.version,
					url: downloadUrl,
					checksum: latestEntry.checksum,
					createdAt: latestEntry.createdAt,
					upToDate: false
				},
				200
			);
		}
	)
	/**
	 * GET /api/ota/download/:version
	 *
	 * Streams a zip bundle. Bundles are immutable — cached forever.
	 */
	.get('/download/:version', async (c) => {
		const manifest = await readManifest(OTA_BUNDLES_DIR);
		const entry = findBundle(manifest, c.req.param('version'));

		if (!entry) return c.json({ error: 'Bundle not found' }, 404);

		const filePath = join(OTA_BUNDLES_DIR, entry.filename);

		try {
			const { size } = await stat(filePath);
			const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
			return new Response(stream, {
				status: 200,
				headers: {
					'Content-Type': 'application/zip',
					'Content-Disposition': `attachment; filename="${entry.filename}"`,
					'Content-Length': size.toString(),
					'Cache-Control': 'public, max-age=31536000, immutable',
					'X-Checksum-Sha256': entry.checksum
				}
			});
		} catch {
			return c.json({ error: 'Bundle file missing on server' }, 500);
		}
	})
	/**
	 * POST /api/ota/upload
	 *
	 * Upload a new bundle. Protected by OTA_UPLOAD_KEY.
	 * Accepts multipart/form-data with:
	 *   - file: the zip bundle (required, max 50 MB, must contain a root index.html)
	 *   - channel: the native compatibility line the bundle was built for, such as cap8 (required)
	 *   - version: custom version string (optional, auto-generated if omitted)
	 */
	.post('/upload', requirePublisherKey, async (c) => {
		// Size guard before reading the body
		const contentLength = parseInt(c.req.header('Content-Length') ?? '0', 10);
		if (contentLength > MAX_UPLOAD_BYTES) {
			return c.json({ error: `Upload exceeds ${MAX_UPLOAD_BYTES / 1024 / 1024} MB limit` }, 413);
		}

		const body = await c.req.raw.formData().catch(() => null);
		if (!body) {
			return c.json({ error: 'Expected multipart/form-data' }, 400);
		}

		const upload = await validateUploadForm(body);
		if (isRejection(upload)) {
			return c.json({ error: upload.error }, upload.status);
		}

		let entry: BundleEntry | null;
		try {
			entry = await publishBundle(upload);
		} catch (error) {
			console.error('OTA: Failed to store uploaded bundle:', error);
			return c.json({ error: 'Failed to store OTA bundle' }, 500);
		}
		if (!entry) {
			return c.json({ error: `Version "${upload.version}" already exists` }, 409);
		}

		console.log(`OTA: Uploaded bundle version="${entry.version}" checksum="${entry.checksum}"`);
		return c.json({ ok: true, version: entry.version, checksum: entry.checksum }, 201);
	});

/**
 * Generate a chronologically sortable version: YYYYMMDD-HHMMSS-mmm
 */
function generateVersion(): string {
	const now = new Date();
	const Y = now.getFullYear().toString();
	const M = (now.getMonth() + 1).toString().padStart(2, '0');
	const D = now.getDate().toString().padStart(2, '0');
	const h = now.getHours().toString().padStart(2, '0');
	const m = now.getMinutes().toString().padStart(2, '0');
	const s = now.getSeconds().toString().padStart(2, '0');
	const ms = now.getMilliseconds().toString().padStart(3, '0');
	return `${Y}${M}${D}-${h}${m}${s}-${ms}`;
}

export { otaRoutes };
