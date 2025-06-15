import { auth } from '$lib/auth/auth';
import { error } from '@sveltejs/kit';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export async function createContext(event: FetchCreateContextFnOptions) {
	const authData = await auth.api.getSession({ headers: event.req.headers });
	if (!authData) error(401, 'Unauthorized');

	return { event, ...authData };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
