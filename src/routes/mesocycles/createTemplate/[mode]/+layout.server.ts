import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import clientPromise from "$lib/mongo/mongodb";
import type { MesocycleTemplateDocument } from "$lib/types/documents";
import { ObjectId } from "mongodb";

export const load: LayoutServerLoad = async ({ params, locals, url }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    throw error(403, "Not logged in");
  }

  let mesocycleTemplate: WithSerializedId<MesocycleTemplate> | undefined = undefined;

  if (params.mode === "new") {
    return { mesocycleTemplate };
  } else if (params.mode !== "edit") {
    throw error(400, "Invalid mode");
  }

  const mesocycleTemplateId = url.searchParams.get("mesocycleTemplateId");
  if (mesocycleTemplateId === null) {
    throw error(400, "No mesocycle template ID given");
  } else if (mesocycleTemplateId.length !== 24) {
    throw error(400, "Mesocycle template ID should be 24 character hex string");
  }

  const client = await clientPromise;
  const mesocycleTemplateDocument = await client
    .db()
    .collection<MesocycleTemplateDocument>("mesocycleTemplates")
    .findOne({ _id: new ObjectId(mesocycleTemplateId), userId: new ObjectId(session.user.id) });

  if (mesocycleTemplateDocument === null) {
    throw error(404, "Mesocycle template not found");
  }

  const { _id, userId, ...otherProps } = mesocycleTemplateDocument;
  mesocycleTemplate = {
    id: _id.toString(),
    ...otherProps
  };
  return { mesocycleTemplate };
};
