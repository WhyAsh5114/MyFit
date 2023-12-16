import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import { GOOGLE_ID, GOOGLE_SECRET, GITHUB_ID, GITHUB_SECRET } from "$env/static/private";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "$lib/mongo/mongodb";

export const handle = SvelteKitAuth({
  providers: [
    Google({ clientId: GOOGLE_ID, clientSecret: GOOGLE_SECRET }),
    GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET })
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
