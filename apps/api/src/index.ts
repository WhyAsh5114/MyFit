import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { Hono } from 'hono';
import { auth } from '../lib/auth.js';
import 'dotenv/config';

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

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

app.get('/api/health', (c) => c.json({ status: 'ok' }));

serve(app);
