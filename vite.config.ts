import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

export const globPatterns = [
	'client/**/*.{js,css,png,svg,ttf,webp,webmanifest}',
	'prerendered/**/*.{html,json}'
];
export const globIgnores = ['client/pwa/**/*'];

export default defineConfig({
	define: {
		'process.env.NODE_ENV': process.env.NODE_ENV === 'production' ? '"production"' : '"development"'
	},
	plugins: [
		tailwindcss(),
		enhancedImages(),
		sveltekit(),
		SvelteKitPWA({
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'service-worker.ts',
			kit: { includeVersionFile: true },
			injectManifest: { globPatterns, globIgnores },
			includeManifestIcons: false,
			manifest: false,
			devOptions: { enabled: true, type: 'module' }
		}),
		devtoolsJson()
	]
});
