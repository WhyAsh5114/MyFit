import pg from 'pg';
import { env } from './env.js';

/**
 * Plain `pg` pool for everything that talks to Postgres outside the Prisma 8
 * contract: better-auth's tables.
 */
export const pool = new pg.Pool({ connectionString: env.DATABASE_URL, ssl: false });
