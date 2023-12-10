import clientPromise from "$lib/mongo/mongodb.js";
import type { MesocycleTemplateDocument } from "$lib/types/documents.js";
import { ObjectId } from "mongodb";

export const GET = async ({ locals, fetch }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  let activeMesocycle: WithSerializedId<Mesocycle> | null = null;
  const getActiveMesocycleResponse = await fetch("/api/mesocycles/getActiveMesocycle");
  if (!getActiveMesocycleResponse.ok) {
    return getActiveMesocycleResponse;
  }
  activeMesocycle = (await getActiveMesocycleResponse.json()) as WithSerializedId<Mesocycle>;

  const client = await clientPromise;
  const activeMesocycleTemplateDocument = await client
    .db()
    .collection<MesocycleTemplateDocument>("mesocycleTemplates")
    .findOne({
      userId: new ObjectId(session.user.id),
      _id: new ObjectId(activeMesocycle.templateMesoId)
    });

  if (activeMesocycleTemplateDocument === null) {
    return new Response("Active mesocycle template not found", { status: 404 });
  }

  return new Response(JSON.stringify(activeMesocycleTemplateDocument), { status: 200 });
};
