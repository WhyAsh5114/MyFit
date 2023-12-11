import type { RequestHandler } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";
import { ObjectId } from "mongodb";
import type { MesocycleTemplateDocument } from "$lib/types/documents";

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Invalid session", {
      status: 403
    });
  }

  const { mesocycleTemplate, mesocycleTemplateId }: APIMesocyclesEditTemplate =
    await request.json();
  const client = await clientPromise;
  try {
    const updatedMesocycleResult = await client
      .db()
      .collection<MesocycleTemplateDocument>("mesocycleTemplates")
      .updateOne(
        {
          userId: new ObjectId(session.user.id),
          _id: new ObjectId(mesocycleTemplateId)
        },
        {
          $set: { ...mesocycleTemplate }
        }
      );

    if (!updatedMesocycleResult.acknowledged) {
      return new Response("Mesocycle template not found", {
        status: 404
      });
    }

    return new Response("Mesocycle updated successfully", {
      status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500
    });
  }
};
