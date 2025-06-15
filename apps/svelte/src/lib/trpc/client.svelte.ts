// src/lib/trpc/client.svelte.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { browser } from '$app/environment';
import { page } from '$app/state';
import type { AppRouter } from './router';

export function useTRPC() {
	return createTRPCClient<AppRouter>({
		links: [
			httpBatchLink({
				url: browser ? '/api/trpc' : `${page.url.origin}/api/trpc`
			})
		]
	});
}
