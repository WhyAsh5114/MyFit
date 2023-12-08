import type { RequestHandler } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";
import { ObjectId } from "mongodb";
import type { MesocycleDocument } from "$lib/types/documents";

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Invalid session", {
      status: 403
    });
  }

  const { mesocycleTemplateId }: APIMesocyclesStartMesocycle = await request.json(),
    client = await clientPromise;

  // Check if a mesocycle is already active
  try {
    const activeMesocycle = await client
      .db()
      .collection<MesocycleDocument>("mesocycles")
      .findOne({
        userId: new ObjectId(session.user.id),
        endTimestamp: { $exists: false }
      });

    if (activeMesocycle !== null) {
      return new Response("A mesocycle is already active", {
        status: 400
      });
    }
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500
    });
  }

  try {
    await client
      .db()
      .collection<MesocycleDocument>("mesocycles")
      .insertOne({
        userId: new ObjectId(session.user.id),
        templateMesoId: new ObjectId(mesocycleTemplateId),
        startTimestamp: Number(new Date()),
        workouts: []
      });

    return new Response("Mesocycle activated successfully", {
      status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500
    });
  }
};
