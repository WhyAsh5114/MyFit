import 'dotenv/config';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Required — app fails fast at startup if missing.
 * Always prefer this over `process.env.X!` so the error message is clear.
 */
function required(key: string): string {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

/** Optional — returns the value or a default. */
function optional(key: string, fallback: string): string {
	return process.env[key] ?? fallback;
}

/** Optional URL — normalizes to an origin and fails fast if invalid. */
function optionalUrlOrigin(key: string): string | undefined {
	const value = process.env[key];
	if (!value) return undefined;

	try {
		return new URL(value).origin;
	} catch {
		throw new Error(`Invalid URL in environment variable: ${key}`);
	}
}

/** Required JSON-encoded value. Fails fast on missing or invalid JSON. */
function requiredJson<T>(key: string): T {
	const raw = required(key);
	try {
		return JSON.parse(raw) as T;
	} catch {
		throw new Error(`Invalid JSON in environment variable: ${key}`);
	}
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const env = {
	// --- Required (app won't start without these) ---
	DATABASE_URL: required('DATABASE_URL'),
	TRUSTED_ORIGINS: requiredJson<string[]>('TRUSTED_ORIGINS'),
	BETTER_AUTH_SECRET: required('BETTER_AUTH_SECRET'),
	BETTER_AUTH_URL: required('BETTER_AUTH_URL'),

	// --- Server ---
	PORT: parseInt(optional('PORT', '3000'), 10),
	NODE_ENV: optional('NODE_ENV', 'development'),

	// --- Email (OTP won't send without this, but app still runs) ---
	RESEND_API_KEY: process.env.RESEND_API_KEY,

	// --- AI Chat (chat feature degrades gracefully without these) ---
	OPENAI_API_KEY: process.env.OPENAI_API_KEY,
	OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
	OPENAI_MODEL_ID: process.env.OPENAI_MODEL_ID,

	// --- OTA (upload endpoint returns 501 without OTA_UPLOAD_KEY) ---
	OTA_BUNDLES_DIR: optional('OTA_BUNDLES_DIR', 'data/ota-bundles'),
	OTA_UPLOAD_KEY: process.env.OTA_UPLOAD_KEY,
	PUBLIC_API_URL: optionalUrlOrigin('PUBLIC_API_URL')
} as const;
