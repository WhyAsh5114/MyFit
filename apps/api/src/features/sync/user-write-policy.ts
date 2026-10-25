import type { Context, Next } from 'hono';

const WRITABLE_USER_FIELDS = new Set(['name', 'image', 'autoUpdate']);

/** Recognizes JSON objects without treating arrays or null as records. */
function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Keeps account lifecycle and authentication fields under Better Auth's control. */
function violatesUserWritePolicy(event: unknown): boolean {
	if (!isRecord(event) || event.entityType !== 'User') return false;
	if (event.operation !== 'update') return true;
	if (!isRecord(event.payload) || !isRecord(event.payload.patch)) return false;
	return Object.keys(event.payload.patch).some((field) => !WRITABLE_USER_FIELDS.has(field));
}

/**
 * Rejects a forbidden User write before any event in the batch reaches SQL.
 * Malformed requests still use the sync adapter's ordinary validation responses.
 */
export async function enforceUserWritePolicy(c: Context, next: Next) {
	let body: unknown;
	try {
		// Preserve the original body for the adapter's contract and payload validation.
		body = await c.req.raw.clone().json();
	} catch {
		return next();
	}
	if (isRecord(body) && Array.isArray(body.events) && body.events.some(violatesUserWritePolicy)) {
		return c.json({ error: 'User sync writes may only update name, image, and autoUpdate.' }, 403);
	}
	return next();
}
