import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export const globPatterns = [
	'client/**/*.{js,css,ico,png,svg,ttf,webp,webmanifest}',
	'prerendered/**/*.{html,json}'
];

export const globIgnores = ['client/pwa/**/*'];

export default defineConfig({
	define: {
		'process.env.NODE_ENV': process.env.NODE_ENV === 'production' ? '"production"' : '"development"'
	},
	plugins: [
		enhancedImages(),
		sveltekit(),
		SvelteKitPWA({
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'service-worker.ts',
			kit: { includeVersionFile: true },
			injectManifest: { globPatterns, globIgnores },
			includeManifestIcons: false,
			manifest: false
		})
	]
});
