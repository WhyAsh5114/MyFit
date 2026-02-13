import { Hono } from 'hono';

const healthRoutes = new Hono()
	/**
	 * Health check endpoint
	 * Returns status of the API
	 */
	.get('/', (c) => c.json({ status: 'ok' }, 200));

export { healthRoutes };
