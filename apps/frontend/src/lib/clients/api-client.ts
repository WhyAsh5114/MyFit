import { PUBLIC_API_URL } from '$app/env/public';
import { hc } from 'hono/client';
import type { AppType } from '@myfit/api';

/**
 * Hono RPC Client for type-safe API calls
 * Provides full type inference from the backend API
 */
export const apiClient = hc<AppType>(PUBLIC_API_URL, {
	init: {
		credentials: 'include'
	}
});
