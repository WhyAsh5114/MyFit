import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "$lib/mongo/mongodb";
import { sequence } from "@sveltejs/kit/hooks";
import {
  AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET,
  AUTH_GITHUB_ID,
  AUTH_GITHUB_SECRET,
  AUTH_SECRET
} from "$env/static/private";
import { redirect } from "@sveltejs/kit";

const unprotectedRoutes = ["/", "/login", "/offline", "/exerciseSplits/templates"];

export const handle = sequence(
  SvelteKitAuth({
    providers: [
      Google({ clientId: AUTH_GOOGLE_ID, clientSecret: AUTH_GOOGLE_SECRET }),
      GitHub({ clientId: AUTH_GITHUB_ID, clientSecret: AUTH_GITHUB_SECRET })
    ],
    adapter: MongoDBAdapter(clientPromise, {
      databaseName: "MyFit_v3"
    }),
    session: { strategy: "database" },
    callbacks: {
      // Attach mongoDB user document ID for easier queries
      // @ts-expect-error strategy: "database" is set, still giving error?
      async session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      }
    },
    secret: AUTH_SECRET,
    trustHost: true
  }),
  async function authorization({ event, resolve }) {
    if (!unprotectedRoutes.includes(event.url.pathname)) {
      const session = await event.locals.getSession();
      if (!session) {
        throw redirect(303, `/login?callbackURL=${event.url.pathname}`);
      }
    }
    return resolve(event);
  }
);
