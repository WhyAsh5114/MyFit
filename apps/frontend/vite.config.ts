import adapter from '@sveltejs/adapter-static';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { otaChannel } from './scripts/ota-channel.js';

export default defineConfig({
	define: { __OTA_CHANNEL__: JSON.stringify(otaChannel()) },
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter({ fallback: 'index.html' }),
			paths: { relative: false },
			// Registered by hooks.client.ts, which skips dev and the native apps.
			serviceWorker: { register: false }
		}),
		devtoolsJson(),
		paraglideVitePlugin({ project: './project.inlang', outdir: './src/lib/paraglide' })
	],
	test: {
		include: ['tests/**/*.test.ts']
	}
});
