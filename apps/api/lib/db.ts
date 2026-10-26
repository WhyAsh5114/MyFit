import postgres from '@prisma/orm-postgres/runtime';
import type { ServerContract } from '@myfit/shared/server';
import { serverContract } from '@myfit/shared/server';
import { env } from './env.js';

const client = postgres<ServerContract>({ contractJson: serverContract });

let connected: Promise<unknown> | null = null;

/** The Prisma 8 Postgres client for the synced models (lazily connected, shared). */
export async function getDb() {
	// Clear on rejection (e.g. Postgres not up yet) so the next call retries.
	connected ??= client.connect({ url: env.DATABASE_URL }).catch((err: unknown) => {
		connected = null;
		throw err;
	});
	await connected;
	return client;
}
