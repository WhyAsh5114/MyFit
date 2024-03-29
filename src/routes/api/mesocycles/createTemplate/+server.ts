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

  const { mesocycleTemplate }: APIMesocyclesCreateTemplate = await request.json();
  const client = await clientPromise;
  try {
    await client
      .db()
      .collection<MesocycleTemplateDocument>("mesocycleTemplates")
      .insertOne({
        userId: new ObjectId(session.user.id),
        ...mesocycleTemplate
      });

    return new Response("Mesocycle created successfully", {
      status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500
    });
  }
};
