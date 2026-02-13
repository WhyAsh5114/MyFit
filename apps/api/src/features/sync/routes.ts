import { Hono } from 'hono';
import { authMiddleware, getUserId } from '../../shared/middleware/auth.js';
import { syncService } from './service.js';

const syncRoutes = new Hono()
	/**
	 * Sync endpoint
	 * Protected - requires authentication
	 * 
	 * Handles bidirectional sync between client and server
	 * Client pushes outbox changes, server returns changes since last sync
	 */
	.post('/', authMiddleware, async (c) => {
		const userId = getUserId(c);
		// TODO: Validate request body with Zod
		// TODO: Call syncService.syncUserData
		return c.json({ error: 'Sync not implemented yet' }, 501);
	});

export { syncRoutes };
