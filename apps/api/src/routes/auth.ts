import { Hono } from 'hono';
import { auth } from '../../lib/auth.js';

const authRoutes = new Hono()
	/**
	 * Better Auth handler
	 * Proxies all auth routes to the better-auth handler
	 */
	.on(['POST', 'GET'], '*', (c) => auth.handler(c.req.raw));

export { authRoutes };
