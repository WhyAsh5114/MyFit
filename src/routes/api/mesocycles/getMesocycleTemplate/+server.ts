import clientPromise from "$lib/mongo/mongodb.js";
import type { MesocycleTemplateDocument } from "$lib/types/documents.js";
import { ObjectId } from "mongodb";

export const GET = async ({ locals, url }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  const mesocycleTemplateId = url.searchParams.get("mesocycleTemplateId");
  if (!mesocycleTemplateId) {
    return new Response("No mesocycle template ID given", { status: 400 });
  }

  const client = await clientPromise;
  const mesocycleTemplateDocument = await client
    .db()
    .collection<MesocycleTemplateDocument>("mesocycleTemplates")
    .findOne({ userId: new ObjectId(session.user.id), _id: new ObjectId(mesocycleTemplateId) });

  if (mesocycleTemplateDocument === null) {
    return new Response("Mesocycle template not found", { status: 404 });
  }
  return new Response(JSON.stringify(mesocycleTemplateDocument), { status: 200 });
};
