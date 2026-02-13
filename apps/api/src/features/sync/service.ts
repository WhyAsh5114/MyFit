import type { Context } from 'hono';
import { getUserId } from '../../shared/middleware/auth.js';

/**
 * Service layer for offline sync operations
 * Handles client changelog push and server state pull
 * 
 * TODO: Implement sync logic
 * - Receive client outbox events
 * - Apply changes to server DB
 * - Resolve conflicts
 * - Return server state changes since last sync
 */
export const syncService = {
	/**
	 * Push client changes and pull server changes
	 * @param userId - Authenticated user ID
	 * @param clientChanges - Outbox events from client
	 * @param lastSyncedAt - Client's last sync timestamp
	 */
	async syncUserData(
		userId: string,
		clientChanges: unknown[],
		lastSyncedAt: string | null
	): Promise<{ serverChanges: unknown[]; timestamp: string }> {
		// TODO: Implement
		throw new Error('Sync not implemented yet');
	}
};
