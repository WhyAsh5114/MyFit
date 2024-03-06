import { SvelteKitAuth } from '@auth/sveltekit';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '../src/lib/mongo/mongodb';
import github from '@auth/core/providers/github';
import google from '@auth/core/providers/google';

export const { handle } = SvelteKitAuth({
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
	trustHost: true
});
