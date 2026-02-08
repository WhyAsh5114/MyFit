import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { Hono } from 'hono';
import { authRoutes } from './routes/auth.js';
import { healthRoutes } from './routes/health.js';
import 'dotenv/config';
import { nutritionDataRoutes } from './routes/nutrition-data.js';

const app = new Hono();
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
	.route('/api/nutrition-data', nutritionDataRoutes);

export type AppType = typeof routes;

serve(app);
