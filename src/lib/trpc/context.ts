import { error, type RequestEvent } from '@sveltejs/kit';

export async function createContext(event: RequestEvent) {
	const session = await event.locals.auth();
	if (!session?.user?.id) error(401, 'Not logged in');
	return { event, session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
