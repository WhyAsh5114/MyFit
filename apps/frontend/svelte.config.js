import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({ fallback: 'index.html' }),
		paths: { relative: false },
		// Registered by hooks.client.ts, which skips dev and the native apps.
		serviceWorker: { register: false }
	}
};

export default config;
