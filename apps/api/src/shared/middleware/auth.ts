import type { Context, Next } from 'hono';
import { auth } from '../../../lib/auth.js';

/**
 * Auth middleware - validates session and attaches userId to context
 * Returns 401 if no valid session exists
 */
export async function authMiddleware(c: Context, next: Next) {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session?.user) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	c.set('userId', session.user.id);
	await next();
}

/**
 * Type helper for getting userId from Hono context
 */
export function getUserId(c: Context): string {
	const userId = c.get('userId');
	if (!userId) throw new Error('userId not found in context');
	return userId;
}
