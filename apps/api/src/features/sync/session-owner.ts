import { HTTPException } from 'hono/http-exception';

/**
 * Pins a sync request to its local database owner even if another tab changed the login cookie.
 * Older clients omit the header and retain their existing session-scoped behavior.
 */
export function requireSyncOwner(request: Request, sessionOwner: string): string {
	const localOwner = request.headers.get('X-Sync-Owner');
	if (localOwner !== null && localOwner !== sessionOwner) {
		throw new HTTPException(401, {
			message: 'Sign in to the account that owns this local database.'
		});
	}
	return sessionOwner;
}
