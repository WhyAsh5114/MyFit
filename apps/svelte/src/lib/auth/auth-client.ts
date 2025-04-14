import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';
import { anonymousClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient({
	baseURL: PUBLIC_BETTER_AUTH_URL,
	plugins: [anonymousClient()]
});
