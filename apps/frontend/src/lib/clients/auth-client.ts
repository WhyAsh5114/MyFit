import { PUBLIC_API_URL } from '$app/env/public';
import { anonymousClient, emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient({
	baseURL: PUBLIC_API_URL,
	plugins: [anonymousClient(), emailOTPClient()]
});
