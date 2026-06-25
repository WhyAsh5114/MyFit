import { Hono } from 'hono';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { env } from '../../../lib/env.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const OTA_BUNDLES_DIR = env.OTA_BUNDLES_DIR;
const OTA_UPLOAD_KEY = env.OTA_UPLOAD_KEY;
const MANIFEST_FILE = join(OTA_BUNDLES_DIR, 'manifest.json');
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BundleEntry {
	version: string;
	filename: string;
	checksum: string;
	createdAt: string;
}

interface Manifest {
	bundles: Record<string, BundleEntry>;
	latest: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function ensureDataDir(): Promise<void> {
	if (!existsSync(OTA_BUNDLES_DIR)) {
		await mkdir(OTA_BUNDLES_DIR, { recursive: true });
	}
}

async function readManifest(): Promise<Manifest> {
	await ensureDataDir();
	try {
		const raw = await readFile(MANIFEST_FILE, 'utf-8');
		return JSON.parse(raw) as Manifest;
	} catch {
		return { bundles: {}, latest: null };
	}
}

async function writeManifest(manifest: Manifest): Promise<void> {
	await ensureDataDir();
	await writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
}

function computeSha256(buffer: Buffer): string {
	return createHash('sha256').update(buffer).digest('hex');
}

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
// Upload lock — prevents concurrent writes from racing on the manifest file.
// Single-process Bun is sufficient; for horizontal scaling, switch to a DB or
// distributed lock.
// ---------------------------------------------------------------------------

let pendingUpload: Promise<void> = Promise.resolve();

async function acquireUploadLock(): Promise<() => void> {
	const prev = pendingUpload;
	let release: () => void;
	pendingUpload = new Promise<void>((resolve) => {
		release = resolve;
	});
	await prev;
	return release!;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

const otaRoutes = new Hono()
	/**
	 * GET /api/ota/latest
	 *
	 * Returns the latest bundle metadata. The client compares its version
	 * with `version` via equality — works across any versioning scheme.
	 */
	.get(
		'/latest',
		zValidator(
			'query',
			z.object({
				platform: z.enum(['ios', 'android', 'web']).optional(),
				currentVersion: z.string().optional()
			})
		),
		async (c) => {
			const manifest = await readManifest();

			if (!manifest.latest) return c.json({ upToDate: true }, 200);

			const latestEntry = manifest.bundles[manifest.latest];
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
	 * Serves a zip bundle. Bundles are immutable — cached forever.
	 */
	.get('/download/:version', async (c) => {
		const manifest = await readManifest();
		const entry = manifest.bundles[c.req.param('version')];

		if (!entry) return c.json({ error: 'Bundle not found' }, 404);

		const filePath = join(OTA_BUNDLES_DIR, entry.filename);

		try {
			const file = await readFile(filePath);
			return new Response(file, {
				status: 200,
				headers: {
					'Content-Type': 'application/zip',
					'Content-Disposition': `attachment; filename="${entry.filename}"`,
					'Content-Length': file.length.toString(),
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
	 *   - file: the zip bundle (required, max 50 MB)
	 *   - version: custom version string (optional, auto-generated if omitted)
	 */
	.post('/upload', async (c) => {
		if (!OTA_UPLOAD_KEY) {
			return c.json({ error: 'OTA uploads not configured on this server' }, 501);
		}

		const authHeader = c.req.header('Authorization');
		if (!authHeader || authHeader !== `Bearer ${OTA_UPLOAD_KEY}`) {
			return c.json({ error: 'Unauthorized' }, 401);
		}

		// Size guard before reading the body
		const contentLength = parseInt(c.req.header('Content-Length') ?? '0', 10);
		if (contentLength > MAX_UPLOAD_BYTES) {
			return c.json({ error: `Upload exceeds ${MAX_UPLOAD_BYTES / 1024 / 1024} MB limit` }, 413);
		}

		let body: FormData;
		try {
			body = await c.req.raw.formData();
		} catch {
			return c.json({ error: 'Expected multipart/form-data' }, 400);
		}

		const file = body.get('file');
		if (!file || !(file instanceof File)) {
			return c.json({ error: 'Missing "file" field in form data' }, 400);
		}

		if (file.size > MAX_UPLOAD_BYTES) {
			return c.json({ error: `Upload exceeds ${MAX_UPLOAD_BYTES / 1024 / 1024} MB limit` }, 413);
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const checksum = computeSha256(buffer);

		let version = (body.get('version') as string | null) ?? generateVersion();
		version = version.replace(/[^a-zA-Z0-9._-]/g, '_');

		// Serialise manifest writes to prevent concurrent uploads from racing
		const release = await acquireUploadLock();
		try {
			const manifest = await readManifest();

			if (manifest.bundles[version]) {
				return c.json({ error: `Version "${version}" already exists` }, 409);
			}

			await ensureDataDir();
			await writeFile(join(OTA_BUNDLES_DIR, `${version}.zip`), buffer);

			manifest.bundles[version] = {
				version,
				filename: `${version}.zip`,
				checksum,
				createdAt: new Date().toISOString()
			};
			manifest.latest = version;
			await writeManifest(manifest);
		} finally {
			release();
		}

		console.log(`OTA: Uploaded bundle version="${version}" checksum="${checksum}"`);
		return c.json({ ok: true, version, checksum }, 201);
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
