import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess()],

	kit: {
		adapter: adapter(),
		serviceWorker: { register: false },
		experimental: { remoteFunctions: true },
		alias: { $routes: 'src/routes' }
	},

	extensions: ['.svelte']
};

export default config;
