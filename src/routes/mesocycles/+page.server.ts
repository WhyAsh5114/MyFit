import type { PageServerLoad } from "./$types";
import clientPromise from "$lib/mongo/mongodb";
import { error } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import type { ActiveMesocycleDocument, MesocycleTemplateDocument } from "$lib/types/documents";

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		throw error(403, "Not logged in");
	}

	const client = await clientPromise;
	const mesocycleTemplateDocuments = client
		.db()
		.collection<MesocycleTemplateDocument>("mesocycleTemplates")
		.find(
			{
				userId: new ObjectId(session.user.id)
			},
			{
				projection: {
					userId: 0
				}
			}
		)
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

	let activeMesocycle: WithSerializedId<ActiveMesocycle> | null = null;
	const activeMesocycleDocument = await client
		.db()
		.collection<ActiveMesocycleDocument>("activeMesocycles")
		.findOne({ userId: new ObjectId(session.user.id) });
	if (activeMesocycleDocument) {
		const { _id, templateMesoId, workouts, startDate } = activeMesocycleDocument;
		activeMesocycle = {
			id: _id.toString(),
			templateMesoId: templateMesoId.toString(),
			workouts: workouts.map((workout) => workout.toString()),
			startDate
		};
	}

	return {
		activeMesocycle,
		streamed: {
			mesocycleTemplatesStreamArray
		}
	};
};
