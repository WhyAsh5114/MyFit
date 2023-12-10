import clientPromise from "$lib/mongo/mongodb.js";
import type { MesocycleDocument } from "$lib/types/documents.js";
import { ObjectId } from "mongodb";

export const GET = async ({ locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  const client = await clientPromise;
  const activeMesocycleDocument = await client
    .db()
    .collection<MesocycleDocument>("mesocycles")
    .findOne({ userId: new ObjectId(session.user.id), endTimestamp: { $exists: false } });

  if (activeMesocycleDocument === null) {
    return new Response("Active mesocycle not found", { status: 404 });
  }
  return new Response(JSON.stringify(activeMesocycleDocument), { status: 200 });
};
