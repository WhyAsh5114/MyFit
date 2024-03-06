import { SvelteKitAuth } from '@auth/sveltekit';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '$lib/mongo/mongodb';
import github from '@auth/sveltekit/providers/github';
import google from '@auth/sveltekit/providers/google';
import { AUTH_SECRET } from '$env/static/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: MongoDBAdapter(clientPromise),
	basePath: '/auth',
	providers: [google, github],
	callbacks: {
		// Attach mongoDB user document ID for easier queries
		async session({ session, user }) {
			session.user.id = user.id;
			return session;
		}
	},
	trustHost: true,
	secret: AUTH_SECRET
});
