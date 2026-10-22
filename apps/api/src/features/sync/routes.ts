import { Hono } from 'hono';
import { createSqlSyncHandlers } from '@prisma-idb/sync-server-sql';
import { sqlSyncAdapter } from '@myfit/schema/server';
import { authMiddleware, getUserId } from '../../shared/middleware/auth.js';
import { getDb } from '../../../lib/db.js';

// Generous headroom over the client's push batch size (50); just a bound so a
// crafted request can't force an unbounded number of sequential transactions.
const MAX_PUSH_BATCH_SIZE = 1000;

// The handlers check the client's storage hash and answer 409 on a mismatch, so a
// client with an out-of-date bundle keeps its queued edits and cursor.
const syncHandlers = createSqlSyncHandlers({
	adapter: sqlSyncAdapter,
	maxBatchSize: MAX_PUSH_BATCH_SIZE
});

/**
 * Sync endpoints
 * Protected - requires authentication
 *
 * The client pushes its outbox, then pulls the changes made since its last cursor.
 * Both endpoints are scoped to the authenticated user.
 */
const syncRoutes = new Hono()
	.post('/push', authMiddleware, async (c) =>
		syncHandlers.push(c.req.raw, { db: await getDb(), scopeKey: getUserId(c) })
	)
	.get('/pull', authMiddleware, async (c) =>
		syncHandlers.pull(c.req.raw, { db: await getDb(), scopeKey: getUserId(c) })
	);

export { syncRoutes };
