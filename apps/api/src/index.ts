import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './features/auth/auth.js';
import { healthRoutes } from './features/health/routes.js';
import { nutritionDataRoutes } from './features/nutrition-data/routes.js';
import { syncRoutes } from './features/sync/routes.js';
import 'dotenv/config';

const app = new Hono();

// Global error handler
app.onError((err, c) => {
	console.error('Unhandled error:', err);
	return c.json({ error: 'Internal server error' }, 500);
});

// CORS middleware
app.use(
	'*',
	cors({
		origin: JSON.parse(process.env.TRUSTED_ORIGINS!),
		allowHeaders: ['Content-Type', 'Authorization'],
		allowMethods: ['POST', 'GET', 'OPTIONS'],
		exposeHeaders: ['Content-Length'],
		maxAge: 600,
		credentials: true
	})
);

const routes = app
	.route('/api/health', healthRoutes)
	.route('/api/auth', authRoutes)
	.route('/api/nutrition-data', nutritionDataRoutes)
	.route('/api/sync', syncRoutes);

export type AppType = typeof routes;

const port = parseInt(process.env.PORT || '3000', 10);

Bun.serve({
	fetch: app.fetch,
	port
});

console.log(`🚀 API server running on port ${port}`);
