import clientPromise from "$lib/mongo/mongodb.js";
import type { MesocycleDocument } from "$lib/types/documents.js";
import { ObjectId } from "mongodb";

export const GET = async ({ locals, url }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  const mesocycleId = url.searchParams.get("mesocycleId");
  if (!mesocycleId) {
    return new Response("No mesocycle ID given", { status: 400 });
  }

  const client = await clientPromise;
  const mesocycleDocument = await client
    .db()
    .collection<MesocycleDocument>("mesocycles")
    .findOne({ userId: new ObjectId(session.user.id), _id: new ObjectId(mesocycleId) });

  if (mesocycleDocument === null) {
    return new Response("Mesocycle not found", { status: 404 });
  }
  return new Response(JSON.stringify(mesocycleDocument), { status: 200 });
};
