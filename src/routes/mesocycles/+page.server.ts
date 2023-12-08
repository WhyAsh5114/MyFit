import type { PageServerLoad } from "./$types";
import clientPromise from "$lib/mongo/mongodb";
import { error } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import type { MesocycleTemplateDocument } from "$lib/types/documents";

export const load: PageServerLoad = async ({ locals, parent, depends }) => {
  depends("mesocycle:templates");
  const session = await locals.getSession();
  if (!session?.user?.id) {
    throw error(403, "Not logged in");
  }

  const { activeMesocycle, activeMesocycleTemplate } = await parent(),
    client = await clientPromise,
    mesocycleTemplateDocuments = client
      .db()
      .collection<Omit<MesocycleTemplateDocument, "userId">>("mesocycleTemplates")
      .find({ userId: new ObjectId(session.user.id) }, { projection: { userId: 0 } })
      .map((mesocycleTemplateDocument) => {
        const { _id, ...otherProps } = mesocycleTemplateDocument,
          mesocycleTemplate: WithSerializedId<MesocycleTemplate> = {
            id: mesocycleTemplateDocument._id.toString(),
            ...otherProps
          };
        return mesocycleTemplate;
      }),
    mesocycleTemplatesStreamArray = [];
  while (await mesocycleTemplateDocuments.hasNext()) {
    mesocycleTemplatesStreamArray.push(mesocycleTemplateDocuments.next());
  }

  return {
    activeMesocycle,
    activeMesocycleTemplate,
    streamed: {
      mesocycleTemplatesStreamArray
    }
  };
};
