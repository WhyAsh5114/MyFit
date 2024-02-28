import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "$lib/mongo/mongodb";

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: MongoDBAdapter(clientPromise),
  basePath: "/auth",
  providers: [Google],
  callbacks: {
    // Attach mongoDB user document ID for easier queries
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    }
  },
  trustHost: true
});
