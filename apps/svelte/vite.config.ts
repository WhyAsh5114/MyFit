import { errors } from '@serwist/build';
import type { PluginOptions, SerwistViteApi, SerwistViteContext } from '@serwist/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { createApi, createContext, dev as devPlugin, main as mainPlugin } from '@serwist/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import config from './svelte.config';

// Source: https://github.com/sveltejs/kit/blob/6419d3eaa7bf1b0a756b28f06a73f71fe042de0a/packages/kit/src/utils/filesystem.js
// License: MIT
/**
 * Resolves a file path without extension. Also handles `/index` if the path
 * actually points to a directory.
 * @param ctx
 * @param api
 * @returns
 */
const resolveEntry = (entry: string): string | null => {
	if (fs.existsSync(entry)) {
		const stats = fs.statSync(entry);
		if (stats.isDirectory()) {
			return resolveEntry(path.join(entry, 'index'));
		}

		return entry;
	}
	const dir = path.dirname(entry);

	if (fs.existsSync(dir)) {
		const base = path.basename(entry);
		const files = fs.readdirSync(dir);

		const found = files.find((file) => file.replace(/\.[^.]+$/, '') === base);

		if (found) return path.join(dir, found);
	}

	return null;
};

// We do not rely on `@serwist/vite`'s built-in `buildPlugin` because
// it runs during the client build, but SvelteKit builds the service worker
// during the server build, which takes place after the client one.
/**
 * Custom Serwist build plugin for your custom SvelteKit integration.
 * @param ctx
 * @param api
 * @returns
 */
const buildPlugin = (ctx: SerwistViteContext, api: SerwistViteApi) => {
	return <Plugin>{
		name: '@serwist/vite:build',
		apply: 'build',
		enforce: 'pre',
		closeBundle: {
			sequential: true,
			order: ctx.userOptions?.integration?.closeBundleOrder,
			async handler() {
				if (api && !api.disabled && ctx.viteConfig.build.ssr) {
					await api.generateSW();
				}
			}
		},
		buildEnd(error) {
			if (error) throw error;
		}
	};
};

export const globPatternsAndIgnores = {
	globPatterns: [
		// Static assets.
		'client/**/*.{js,css,ico,png,svg,webp,json,webmanifest,ttf}',
		// Note: comment out the following if you don't have prerendered pages.
		'prerendered/pages/**/*.html',
		// Note: comment out the following if your prerendered pages do not have any data.
		'prerendered/dependencies/**/__data.json'
	],
	globIgnores: ['server/*.*', 'client/service-worker.js', 'client/pwa/**/*']
};

// Here is the main logic: it stores your Serwist configuration, creates `@serwist/vite`'s
// context and API, and constructs the necessary Vite plugins.
const serwist = (): Plugin[] => {
	let buildAssetsDir = config.kit?.appDir ?? '_app/';
	if (buildAssetsDir[0] === '/') {
		buildAssetsDir = buildAssetsDir.slice(1);
	}
	if (buildAssetsDir[buildAssetsDir.length - 1] !== '/') {
		buildAssetsDir += '/';
	}
	// This part is your Serwist configuration.
	const options: PluginOptions = {
		// We will set these later in `configureOptions`.
		swSrc: null!,
		swDest: null!,
		swUrl: '/service-worker.js',
		// We will set this later in `configureOptions`.
		globDirectory: null!,
		...globPatternsAndIgnores,
		injectionPoint: 'self.__SW_MANIFEST',
		// We don't want to version 'client/_app/immutable/**/*' files because they are
		// already versioned by Vite via their URLs.
		dontCacheBustURLsMatching: new RegExp(`^client/${buildAssetsDir}immutable/`),
		integration: {
			closeBundleOrder: 'pre',
			// These options depend on `viteConfig`, so we have to use `@serwist/vite`'s configuration hook.
			configureOptions(viteConfig, options) {
				const clientOutDir = path.resolve(viteConfig.root, viteConfig.build.outDir, '../client');

				// Kit fixes the service worker's name to 'service-worker.js'
				// This tells Serwist to replace `injectionPoint` with the precache manifest in the bundled service worker.
				if (viteConfig.isProduction) {
					options.swSrc = path.resolve(clientOutDir, 'service-worker.js');
					options.swDest = path.resolve(clientOutDir, 'service-worker.js');
				} else {
					// In development, you may want `@serwist/vite` to bundle your service worker and make it available at `swUrl`.
					// Resolve `swSrc` the same way as SvelteKit's.
					const swSrc = resolveEntry(
						path.join(viteConfig.root, config.kit?.files?.serviceWorker ?? 'src/service-worker')
					);
					if (swSrc) {
						options.swSrc = swSrc;
						// We want to save the resulting development service worker somewhere on the filesystem
						// so that `@serwist/build` can pick it up.
						options.swDest = path.join(
							os.tmpdir(),
							`serwist-vite-integration-svelte-${crypto.randomUUID()}.js`
						);
					} else {
						throw new Error(errors['invalid-sw-src']);
					}
				}

				// `clientOutDir` is '.svelte-kit/output/client'. However, since we also want to precache prerendered
				// pages in the '.svelte-kit/output/prerendered' directory, we have to move one directory up.
				options.globDirectory = path.resolve(clientOutDir, '..');

				options.manifestTransforms = [
					// This `manifestTransform` makes the precache manifest valid.
					async (entries) => {
						const manifest = entries.map((e) => {
							// Static assets are in the ".svelte-kit/output/client" directory.
							// Prerender pages are in the ".svelte-kit/output/prerendered/pages" directory.
							// Remove the prefix, but keep the ending slash.
							if (e.url.startsWith('client/')) {
								e.url = e.url.slice(6);
							} else if (e.url.startsWith('prerendered/pages/')) {
								e.url = e.url.slice(17);
							} else if (e.url.startsWith('prerendered/dependencies/')) {
								e.url = e.url.slice(24);
							}

							if (e.url.endsWith('.html')) {
								// trailingSlash: 'always'
								// https://kit.svelte.dev/docs/page-options#trailingslash
								// "/abc/index.html" -> "/abc/"
								// "/index.html" -> "/"
								if (e.url.endsWith('/index.html')) {
									e.url = e.url.slice(0, e.url.lastIndexOf('/') + 1);
								}
								// trailingSlash: 'ignored'
								// trailingSlash: 'never'
								// https://kit.svelte.dev/docs/page-options#trailingslash
								// "/xxx.html" -> "/xxx"
								else {
									e.url = e.url.substring(0, e.url.lastIndexOf('.'));
								}
							}

							// Finally, prepend `viteConfig.base`.
							// "/path" -> "/base/path"
							// "/" -> "/base/"
							e.url = path.posix.join(viteConfig.base, e.url);

							return e;
						});

						return { manifest };
					}
				];
			}
		}
	};
	const ctx = createContext(options, undefined);
	const api = createApi(ctx);
	return [mainPlugin(ctx, api), devPlugin(ctx, api), buildPlugin(ctx, api)];
};

export default defineConfig({
	plugins: [enhancedImages(), sveltekit(), serwist()]
});
