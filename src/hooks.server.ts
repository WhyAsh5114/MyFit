import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import {
  AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET,
  AUTH_GITHUB_ID,
  AUTH_GITHUB_SECRET
} from "$env/static/private";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "$lib/mongo/mongodb";

export const handle = SvelteKitAuth({
  providers: [
    Google({ clientId: AUTH_GOOGLE_ID, clientSecret: AUTH_GOOGLE_SECRET }),
    GitHub({ clientId: AUTH_GITHUB_ID, clientSecret: AUTH_GITHUB_SECRET })
  ],
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: "MyFit_v2"
  }),
  callbacks: {
    // Attach mongoDB user document ID for easier queries
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    }
  }
});
