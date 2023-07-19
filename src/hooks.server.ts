import { SvelteKitAuth } from '@auth/sveltekit';
import GoogleProvider from '@auth/core/providers/google';
import GitHub from '@auth/core/providers/github';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '$lib/mongodb';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';

export const handle = SvelteKitAuth({
	// @ts-expect-error in beta
	adapter: MongoDBAdapter(clientPromise),
	providers: [
		GoogleProvider({
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET
		}),
		GitHub({ clientId: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET })
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
