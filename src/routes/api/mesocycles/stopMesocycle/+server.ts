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

  const { activeMesocycleId }: APIMesocyclesStopMesocycle = await request.json(),
    client = await clientPromise;

  try {
    const activeMesocycle = await client
      .db()
      .collection<MesocycleDocument>("mesocycles")
      .findOneAndUpdate(
        {
          _id: new ObjectId(activeMesocycleId),
          userId: new ObjectId(session.user.id)
        },
        { $set: { endTimestamp: Number(new Date()) } }
      );

    // Check if active mesocycle exists
    if (activeMesocycle === null) {
      return new Response("Active mesocycle not found", {
        status: 404
      });
    }

    return new Response("Stopped and saved successfully", {
      status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500
    });
  }
};
