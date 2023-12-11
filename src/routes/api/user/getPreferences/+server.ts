import clientPromise from "$lib/mongo/mongodb.js";
import type { UserPreferencesDocument } from "$lib/types/documents.js";
import { ObjectId } from "mongodb";

export const GET = async ({ locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  const client = await clientPromise;
  const userPreferencesDocument = await client
    .db()
    .collection<UserPreferencesDocument>("userPreferences")
    .findOne({ userId: new ObjectId(session.user.id) }, { projection: { _id: 0, userId: 0 } });

  return new Response(JSON.stringify(userPreferencesDocument), { status: 200 });
};
