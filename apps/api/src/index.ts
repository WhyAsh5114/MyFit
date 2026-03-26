import { app } from './app.js';
export type { AppType } from './app.js';

const port = parseInt(process.env.PORT || '3000', 10);

Bun.serve({
	fetch: app.fetch,
	port
});

console.log(`🚀 API server running on port ${port}`);
