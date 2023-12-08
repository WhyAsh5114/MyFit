import type { RequestHandler } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";
import { ObjectId } from "mongodb";
import type { MesocycleDocument, MesocycleTemplateDocument } from "$lib/types/documents";

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Invalid session", {
      status: 403
    });
  }

  const { mesocycleTemplateId }: APIMesocyclesDeleteTemplate = await request.json();
  const client = await clientPromise;

  // Don't delete template if active mesocycle
  try {
    const activeMesocycle = await client
      .db()
      .collection<MesocycleDocument>("mesocycles")
      .findOne({
        userId: new ObjectId(session.user.id),
        templateMesoId: new ObjectId(mesocycleTemplateId),
        endTimestamp: { $exists: false }
      });

    if (activeMesocycle) {
      return new Response("Cannot delete an active mesocycle", {
        status: 400
      });
    }
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500
    });
  }

  try {
    const deleteResult = await client
      .db()
      .collection<MesocycleTemplateDocument>("mesocycleTemplates")
      .deleteOne({
        _id: new ObjectId(mesocycleTemplateId),
        userId: new ObjectId(session.user.id)
      });

    if (deleteResult.deletedCount === 0) {
      return new Response("Mesocycle not found", {
        status: 404
      });
    }

    return new Response("Mesocycle deleted successfully", {
      status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500
    });
  }
};
