import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { Hono } from 'hono';
import { authRoutes } from './features/auth/auth.js';
import { healthRoutes } from './features/health/routes.js';
import 'dotenv/config';
import { nutritionDataRoutes } from './features/nutrition-data/routes.js';
import { syncRoutes } from './features/sync/routes.js';

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

serve(app);
