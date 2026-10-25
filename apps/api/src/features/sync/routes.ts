import { Hono } from 'hono';
import { createSqlSync } from '@prisma-idb/sync-server-sql';
import { clientContract, serverContract } from '@myfit/schema/server';
import { authMiddleware, requireSessionUserId } from '../../shared/middleware/auth.js';
import { requireSyncOwner } from './session-owner.js';
import { getDb } from '../../../lib/db.js';
import { writePolicies } from './write-policies.ts';

// Generous headroom over the client's push batch size (50); just a bound so a
// crafted request can't force an unbounded number of sequential transactions.
const MAX_PUSH_BATCH_SIZE = 1000;

// The handlers check the client's storage hash and answer 409 on a mismatch, so a
// client with an out-of-date bundle keeps its queued edits and cursor.
const syncHandlers = createSqlSync({
	contract: serverContract,
	clientContract,
	rootModel: 'User',
	db: getDb,
	scopeKey: async (request) => requireSyncOwner(request, await requireSessionUserId(request)),
	writePolicies,
	maxBatchSize: MAX_PUSH_BATCH_SIZE
});

/**
 * Sync endpoints
 * Protected - requires authentication
 *
 * The client pushes its outbox, then pulls the changes made since its last cursor.
 * Both endpoints are scoped to the authenticated user: the middleware answers 401,
 * and the handlers resolve the scope from the same session.
 */
const syncRoutes = new Hono()
	.post('/push', authMiddleware, (c) => syncHandlers.push(c.req.raw))
	.get('/pull', authMiddleware, (c) => syncHandlers.pull(c.req.raw));

export { syncRoutes };
