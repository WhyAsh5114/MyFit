import { SvelteKitAuth } from '@auth/sveltekit';
import GoogleProvider from '@auth/core/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '$lib/mongodb';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const protectedRoutes = ['/profile', '/settings'];

export const authorization: Handle = async ({ event, resolve }) => {
	for (let i = 0; i < protectedRoutes.length; i++) {
		if (event.url.pathname.startsWith(protectedRoutes[i])) {
			const session = await event.locals.getSession();
			if (!session) {
				throw redirect(303, '/login');
			}
		}
	}
	return resolve(event);
};

export const handle: Handle = sequence(
	SvelteKitAuth({
		// @ts-expect-error in beta
		adapter: MongoDBAdapter(clientPromise),
		providers: [
			// @ts-expect-error in experimental phase, no documentation available
			GoogleProvider({
				clientId: GOOGLE_CLIENT_ID as string,
				clientSecret: GOOGLE_CLIENT_SECRET as string
			})
		],
		callbacks: {
			session: async ({ session }) => {
				return session;
			}
		},
		pages: {
			signIn: '/login'
		}
	}),
	authorization
);
