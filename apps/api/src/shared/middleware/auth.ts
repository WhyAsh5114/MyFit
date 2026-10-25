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

/**
 * Resolves the signed-in user's id from a raw request, for libraries that take a `Request`
 * instead of a Hono context. Throws when there is no session, so it never yields an empty scope.
 */
export async function requireSessionUserId(request: Request): Promise<string> {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw new Error('No authenticated session');
	return session.user.id;
}
