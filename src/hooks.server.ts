import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/core/providers/google";
import { GOOGLE_ID, GOOGLE_SECRET } from "$env/static/private";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "$lib/mongodb";

export const handle = SvelteKitAuth({
	providers: [Google({ clientId: GOOGLE_ID, clientSecret: GOOGLE_SECRET })],
	adapter: MongoDBAdapter(clientPromise, {
		databaseName: "MyFit-v2"
	})
});
