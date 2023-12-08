import type { RequestHandler } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";
import { ObjectId } from "mongodb";
import type { UserPreferencesDocument } from "$lib/types/documents";

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Invalid session", {
      status: 403
    });
  }

  const userPreferences: APIUserUpdatePreferences = await request.json(),
    client = await clientPromise;
  try {
    await client
      .db()
      .collection<UserPreferencesDocument>("userPreferences")
      .updateOne(
        { userId: new ObjectId(session.user.id) },
        { $set: userPreferences },
        { upsert: true }
      );

    return new Response("User preferences updated successfully", {
      status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500
    });
  }
};
