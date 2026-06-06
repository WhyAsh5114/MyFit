import { Hono } from 'hono';
import { cors } from 'hono/cors';
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
	.route('/api/health', (await import('./features/health/routes.js')).healthRoutes)
	.route('/api/auth', (await import('./features/auth/auth.js')).authRoutes)
	.route(
		'/api/nutrition-data',
		(await import('./features/nutrition-data/routes.js')).nutritionDataRoutes
	)
	.route('/api/sync', (await import('./features/sync/routes.js')).syncRoutes)
	.route('/api/chat', (await import('./features/chat/routes.js')).chatRoutes);

export type AppType = typeof routes;

export { app };
