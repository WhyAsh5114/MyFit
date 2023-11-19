import type { LayoutServerLoad } from "./$types";
import clientPromise from "$lib/mongo/mongodb";
import { error } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import type { MesocycleTemplateDocument } from "$lib/types/documents";

export const load: LayoutServerLoad = async ({ locals, parent }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		throw error(403, "Not logged in");
	}

	const { activeMesocycle, activeMesocycleTemplate } = await parent();

	const client = await clientPromise;
	const mesocycleTemplateDocuments = client
		.db()
		.collection<Omit<MesocycleTemplateDocument, "userId">>("mesocycleTemplates")
		.find({ userId: new ObjectId(session.user.id) }, { projection: { userId: 0 } })
		.map((mesocycleTemplateDocument) => {
			const { _id, ...otherProps } = mesocycleTemplateDocument;
			const mesocycleTemplate: WithSerializedId<MesocycleTemplate> = {
				id: mesocycleTemplateDocument._id.toString(),
				...otherProps
			};
			return mesocycleTemplate;
		});

	const mesocycleTemplatesStreamArray = [];
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
