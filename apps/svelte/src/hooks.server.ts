import { auth } from '$lib/auth/auth';
import { createContext } from '$lib/trpc/context';
import { appRouter } from '$lib/trpc/router';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const endpoint = '/api/trpc';

const authHandler: Handle = ({ event, resolve }) => {
	return svelteKitHandler({ event, resolve, auth });
};

const trpcHandler: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith(endpoint)) {
		return fetchRequestHandler({
			endpoint,
			req: event.request,
			router: appRouter,
			createContext
		});
	}

	const response = await resolve(event);
	return response;
};

export const handle = sequence(authHandler, trpcHandler);
