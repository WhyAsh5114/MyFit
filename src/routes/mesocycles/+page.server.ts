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
		.collection<Omit<MesocycleTemplateDocument, "userId">>("mesocycleTemplates")
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
	let activeMesocycleTemplate: WithSerializedId<MesocycleTemplate> | null = null;
	const activeMesocycleDocument = await client
		.db()
		.collection<Omit<ActiveMesocycleDocument, "userId">>("activeMesocycles")
		.findOne({ userId: new ObjectId(session.user.id) }, { projection: { userId: 0 } });
	if (!activeMesocycleDocument) {
		return {
			activeMesocycle,
			activeMesocycleTemplate,
			streamed: {
				mesocycleTemplatesStreamArray
			}
		};
	}

	const { _id, templateMesoId, workouts, startTimestamp } = activeMesocycleDocument;
	activeMesocycle = {
		id: _id.toString(),
		templateMesoId: templateMesoId.toString(),
		workouts: workouts.map((workout) => workout.toString()),
		startTimestamp
	};

	const activeMesocycleTemplateDocument = await client
		.db()
		.collection<Omit<MesocycleTemplateDocument, "userId">>("mesocycleTemplates")
		.findOne({ _id: new ObjectId(activeMesocycle.templateMesoId) }, { projection: { userId: 0 } });
	if (activeMesocycleTemplateDocument) {
		const { _id, ...otherProps } = activeMesocycleTemplateDocument;
		activeMesocycleTemplate = {
			id: activeMesocycleTemplateDocument._id.toString(),
			...otherProps
		};
	}

	return {
		activeMesocycle,
		activeMesocycleTemplate,
		streamed: {
			mesocycleTemplatesStreamArray
		}
	};
};
