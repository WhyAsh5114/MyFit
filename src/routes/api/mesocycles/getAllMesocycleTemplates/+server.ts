import clientPromise from "$lib/mongo/mongodb.js";
import type { MesocycleTemplateDocument } from "$lib/types/documents.js";
import { ObjectId } from "mongodb";

export const GET = async ({ locals, url }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  const page = parseInt(url.searchParams.get("page") ?? "");
  let skip: number | undefined = undefined;
  if (page >= 0) skip = page * 10;

  const client = await clientPromise;
  const mesocycleTemplatesCount = await client
    .db()
    .collection("mesocycleTemplates")
    .countDocuments({ userId: new ObjectId(session.user.id) });
  const mesocycleTemplateCursor = client
    .db()
    .collection<MesocycleTemplateDocument>("mesocycleTemplates")
    .find({ userId: new ObjectId(session.user.id) });

  if (skip !== undefined) mesocycleTemplateCursor.skip(skip).limit(10);

  return new Response(
    JSON.stringify({
      mesocycleTemplates: await mesocycleTemplateCursor.toArray(),
      mesocycleTemplatesCount
    }),
    { status: 200 }
  );
};
