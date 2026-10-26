import postgres from '@prisma/orm-postgres/runtime';
import pg from 'pg';
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

// Food search is the one expensive query, so it gets a small pool of its own. Searches beyond
// the pool size wait in line (or are turned away) instead of competing with sync and auth for
// the CPU. Size it to the database host's cores: this is the host's 2 vCPUs.
const SEARCH_POOL_SIZE = 2;
const SEARCH_POOL_WAIT_MS = 5_000;
const SEARCH_STATEMENT_TIMEOUT_MS = 3_000;

const searchClient = postgres<ServerContract>({ contractJson: serverContract });

let searchConnected: Promise<unknown> | null = null;

/**
 * The Prisma 8 Postgres client for food search (lazily connected, shared). Its connections
 * cancel statements that run too long, and turn off JIT: the planner's cost estimates for
 * the search are high enough to JIT-compile every request, which costs more than running it.
 */
export async function getSearchDb() {
	searchConnected ??= searchClient.connect({
		pg: new pg.Pool({
			connectionString: env.DATABASE_URL,
			ssl: false,
			max: SEARCH_POOL_SIZE,
			connectionTimeoutMillis: SEARCH_POOL_WAIT_MS,
			statement_timeout: SEARCH_STATEMENT_TIMEOUT_MS,
			options: '-c jit=off'
		})
	});
	await searchConnected;
	return searchClient;
}
