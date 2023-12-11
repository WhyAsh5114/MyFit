import clientPromise from "$lib/mongo/mongodb.js";
import type { MesocycleDocument } from "$lib/types/documents.js";
import { ObjectId, type Filter } from "mongodb";

export const GET = async ({ locals, url }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  const page = parseInt(url.searchParams.get("page") ?? "");
  let skip: number | undefined = undefined;
  if (page >= 0) skip = page * 10;

  const filter: Filter<MesocycleDocument> = { userId: new ObjectId(session.user.id) };
  const mesocycleTemplateId = url.searchParams.get("mesocycleTemplateId");
  if (mesocycleTemplateId) {
    filter.templateMesoId = new ObjectId(mesocycleTemplateId);
  }

  const client = await clientPromise;
  const mesocycleCursor = client.db().collection<MesocycleDocument>("mesocycles").find(filter);
  if (skip !== undefined) mesocycleCursor.skip(skip).limit(10);

  return new Response(JSON.stringify(await mesocycleCursor.toArray()), { status: 200 });
};
