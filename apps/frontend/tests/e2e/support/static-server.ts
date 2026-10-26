import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

/**
 * Serves `build/` the way the production nginx does: a real file if there is one, otherwise
 * `index.html`, which the client router takes over. `vite preview` doesn't, since it serves the
 * prerendered landing page for `/index.html`, so deep links would boot into the wrong page.
 */
const ROOT = join(import.meta.dirname, '../../../build');
const TYPES: Record<string, string> = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.webp': 'image/webp',
	'.png': 'image/png',
	'.ttf': 'font/ttf',
	'.woff2': 'font/woff2',
	'.txt': 'text/plain'
};

createServer((req, res) => {
	const { pathname } = new URL(req.url ?? '/', 'http://localhost');
	let file = join(ROOT, normalize(decodeURIComponent(pathname)));
	if (!file.startsWith(ROOT) || !existsSync(file) || !statSync(file).isFile()) {
		file = join(ROOT, 'index.html');
	}
	res.setHeader('content-type', TYPES[extname(file)] ?? 'application/octet-stream');
	createReadStream(file).pipe(res);
}).listen(Number(process.env.PORT ?? 4173));
