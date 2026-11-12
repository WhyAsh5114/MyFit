import type { S3Client } from 'bun';
import { env } from './env.js';

let client: S3Client | null | undefined;

/**
 * The S3-compatible bucket for chat photos, or `null` when storage is not configured. Bun's own
 * client is loaded lazily, so modules that import this still load under Node (the test runner).
 */
export async function getStorage(): Promise<S3Client | null> {
	if (client !== undefined) return client;
	if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
		client = null;
		return client;
	}
	const { S3Client } = await import('bun');
	client = new S3Client({
		endpoint: env.S3_ENDPOINT,
		region: env.S3_REGION,
		bucket: env.S3_BUCKET,
		accessKeyId: env.S3_ACCESS_KEY_ID,
		secretAccessKey: env.S3_SECRET_ACCESS_KEY
	});
	return client;
}
