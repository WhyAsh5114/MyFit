import { browser } from '$app/env';
import { QueryClient } from '@tanstack/svelte-query';

export const queryClient = new QueryClient({
	defaultOptions: { queries: { enabled: browser } }
});
