import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "$lib/mongo/mongodb";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET
} from "$env/static/private";

export const handle = SvelteKitAuth({
  providers: [
    Google({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET }),
    GitHub({ clientId: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET })
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
  },
  trustHost: true
});
