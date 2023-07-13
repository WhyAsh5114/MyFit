import { SvelteKitAuth } from '@auth/sveltekit';
import GoogleProvider from '@auth/core/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '$lib/mongodb';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';

export const handle = SvelteKitAuth({
	// @ts-expect-error in beta
	adapter: MongoDBAdapter(clientPromise),
	providers: [
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
	},
	trustHost: true
});
