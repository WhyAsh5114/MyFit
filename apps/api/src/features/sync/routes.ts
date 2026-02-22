import { Hono } from 'hono';
import { authMiddleware, getUserId } from '../../shared/middleware/auth.js';
import { zValidator } from '@hono/zod-validator';
import { outboxEventSchema } from '../../../generated/prisma-idb/validators.js';
import {
	applyPush,
	pullAndMaterializeLogs
} from '../../../generated/prisma-idb/server/batch-processor.js';
import z from 'zod';
import { prisma } from '../../../lib/prisma.js';

const syncRoutes = new Hono()
	/**
	 * Sync endpoint
	 * Protected - requires authentication
	 *
	 * Handles bidirectional sync between client and server
	 * Client pushes outbox changes, server returns changes since last sync
	 */
	.post(
		'/push',
		authMiddleware,
		zValidator('json', z.object({ events: z.array(outboxEventSchema) })),
		async (c) => {
			const userId = getUserId(c);
			const { events } = c.req.valid('json');

			let pushResults;
			try {
				pushResults = await applyPush({
					events,
					scopeKey: userId,
					prisma
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Unknown error';
				const status = message.startsWith('Batch size') ? 413 : 500;
				return c.json({ error: message }, status);
			}
			return c.json(pushResults, 200);
		}
	)
	/**
	 * Accept lastChangelogId from client
	 * Return server changes since that timestamp
	 * Handle pagination if needed
	 */
	.get(
		'/pull',
		authMiddleware,
		zValidator('query', z.object({ lastChangelogId: z.uuidv7().optional() })),
		async (c) => {
			const userId = getUserId(c);
			const { lastChangelogId } = c.req.valid('query');
			const logsWithRecords = await pullAndMaterializeLogs({
				prisma,
				scopeKey: userId,
				lastChangelogId
			});
			return c.json(
				{
					cursor: logsWithRecords.at(-1)?.id ?? lastChangelogId,
					logsWithRecords
				},
				200
			);
		}
	);

export type SyncRoutesType = typeof syncRoutes;

export { syncRoutes };
