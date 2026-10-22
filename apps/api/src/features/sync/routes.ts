import { Hono } from 'hono';
import { authMiddleware, getUserId } from '../../shared/middleware/auth.js';
import { zValidator } from '@hono/zod-validator';
import { pushRequestBodySchema } from '@prisma-idb/sync-extension-idb/schemas';
import { sqlSyncAdapter, STORAGE_HASH_HEADER } from '@myfit/schema/server';

import z from 'zod';
import { getDb } from '../../../lib/db.js';

// Generous headroom over the client's push batch size (50); just a bound so a
// crafted request can't force an unbounded number of sequential transactions.
const MAX_PUSH_BATCH_SIZE = 1000;

// A 409 tells the client its bundle's contract differs from the server's, so it keeps its
// queued edits and cursor and asks the user to reload instead of dropping them.
const CONTRACT_MISMATCH_ERROR = 'Client contract is out of date';

const syncRoutes = new Hono()
	/**
	 * Sync endpoint
	 * Protected - requires authentication
	 *
	 * Handles bidirectional sync between client and server
	 * Client pushes outbox changes, server returns changes since last sync
	 */
	.post('/push', authMiddleware, async (c) => {
		const scopeKey = getUserId(c);

		// Not zValidator: sync-extension-idb ships its own zod instance, whose types
		// zValidator's overloads reject.
		const body = pushRequestBodySchema.safeParse(await c.req.json().catch(() => null));
		if (!body.success) {
			return c.json({ error: 'Malformed request body', details: body.error.issues }, 400);
		}

		const outcome = await sqlSyncAdapter.applyPush(await getDb(), {
			events: body.data.events,
			scopeKey,
			clientStorageHash: c.req.header(STORAGE_HASH_HEADER),
			maxBatchSize: MAX_PUSH_BATCH_SIZE
		});
		if (!outcome.ok) {
			switch (outcome.reason) {
				case 'batch-too-large':
					return c.json(
						{ error: `Batch size exceeds the maximum of ${outcome.maxBatchSize} events` },
						413
					);
				case 'duplicate-event-id':
					return c.json({ error: 'Duplicate event id in push batch' }, 400);
				case 'contract-mismatch':
					return c.json({ error: CONTRACT_MISMATCH_ERROR }, 409);
			}
		}
		return c.json(outcome.results, 200);
	})
	/**
	 * Accept `since` (the last changelog id the client received)
	 * Return the next page of server changes, each re-authorized against live data
	 */
	.get(
		'/pull',
		authMiddleware,
		zValidator('query', z.object({ since: z.uuidv7().optional() })),
		async (c) => {
			const scopeKey = getUserId(c);
			const { since } = c.req.valid('query');

			const outcome = await sqlSyncAdapter.pull(await getDb(), {
				scopeKey,
				clientStorageHash: c.req.header(STORAGE_HASH_HEADER),
				lastChangelogId: since ?? null
			});
			if (!outcome.ok) {
				return outcome.reason === 'contract-mismatch'
					? c.json({ error: CONTRACT_MISMATCH_ERROR }, 409)
					: c.json({ error: 'since must be a changelog id' }, 400);
			}
			return c.json(outcome.logs, 200);
		}
	);

export type SyncRoutesType = typeof syncRoutes;

export { syncRoutes };
