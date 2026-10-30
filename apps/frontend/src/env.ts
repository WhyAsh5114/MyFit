import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_POSTHOG_KEY: { public: true, static: true },
	PUBLIC_POSTHOG_HOST: { public: true, static: true },
	PUBLIC_API_URL: { public: true, static: true }
});
