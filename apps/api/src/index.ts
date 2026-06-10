import { app } from './app.js';
import { env } from '../lib/env.js';
export type { AppType } from './app.js';

const port = env.PORT;

Bun.serve({
	fetch: app.fetch,
	port,
	idleTimeout: 120
});

console.log(`🚀 API server running on port ${port}`);
