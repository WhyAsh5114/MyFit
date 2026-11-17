// Serves the last capture as a canvas. It only reads `screenshots/`; `pnpm screenshots` makes new images.
//   pnpm screenshots:serve                 # http://localhost:4280
//   SCREENSHOT_PORT=5000 pnpm screenshots:serve
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { renderCanvas } from './render-canvas.mjs';

const root = join(import.meta.dirname, '../../screenshots');
const manifest = join(root, 'manifest.json');
if (!existsSync(manifest)) {
	console.error('No screenshots yet. Run `pnpm screenshots` first.');
	process.exit(1);
}

const TYPES = {
	'.json': 'application/json',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.txt': 'text/plain; charset=utf-8'
};
const port = Number(process.env.SCREENSHOT_PORT ?? 4280);

createServer((req, res) => {
	const { pathname } = new URL(req.url ?? '/', 'http://localhost');
	res.setHeader('cache-control', 'no-store');
	if (pathname === '/' || pathname === '/index.html') {
		// Rendered per request, so a capture that finishes while this runs shows on reload.
		res.setHeader('content-type', 'text/html; charset=utf-8');
		res.end(renderCanvas(manifest));
		return;
	}
	const file = join(root, normalize(decodeURIComponent(pathname)));
	if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) {
		res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
		return;
	}
	res.setHeader('content-type', TYPES[extname(file)] ?? 'application/octet-stream');
	createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Screens: http://localhost:${port}`));
