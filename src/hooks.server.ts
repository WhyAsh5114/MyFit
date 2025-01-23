import { SvelteKitAuth } from '@auth/sveltekit';
import GoogleProvider from '@auth/core/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '$lib/mongodb';
import { GOOGLE_ID, GOOGLE_SECRET } from '$env/static/private';

export const handle = SvelteKitAuth({
	adapter: MongoDBAdapter(clientPromise),
	providers: [
		GoogleProvider({
			clientId: GOOGLE_ID,
			clientSecret: GOOGLE_SECRET
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
