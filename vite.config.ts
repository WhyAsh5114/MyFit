import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			srcDir: 'src',
			registerType: 'prompt',
			strategies: 'generateSW',
			scope: '/',
			base: '/',
			manifest: {
				name: 'MyFit',
				short_name: 'MyFit',
				start_url: '/',
				display: 'standalone',
				background_color: '#000000',
				theme_color: '#323b49',
				orientation: 'portrait',
				description: "A fitness app with all the logging and tracking options you'll ever need",
				icons: [
					{
						src: '/favicon.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable any'
					}
				]
			},
			injectManifest: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}']
			}
		})
	]
});
