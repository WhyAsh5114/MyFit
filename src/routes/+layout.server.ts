import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import clientPromise from "$lib/mongo/mongodb";
import type { ActiveMesocycleDocument, MesocycleTemplateDocument } from "$lib/types/documents";
import { ObjectId, type WithId } from "mongodb";

const unprotectedRoutes = ["/", "/login"];

export const load: LayoutServerLoad = async ({ locals, url, depends }) => {
	depends("mesocycle:active");
	const session = await locals.getSession();

	if (!session && !unprotectedRoutes.includes(url.pathname)) {
		throw redirect(303, `/login?callbackURL=${url.pathname}`);
	}

	let activeMesocycle: WithSerializedId<ActiveMesocycle> | null = null;
	let activeMesocycleTemplate: WithSerializedId<MesocycleTemplate> | null = null;
	if (!session?.user?.id) {
		return { session, activeMesocycle, activeMesocycleTemplate };
	}

	const client = await clientPromise;
	const activeMesocycleDocument = await client
		.db()
		.collection<Omit<ActiveMesocycleDocument, "userId">>("activeMesocycles")
		.findOne({ userId: new ObjectId(session.user.id) }, { projection: { userId: 0 } });
	if (!activeMesocycleDocument) {
		return {
			session,
			activeMesocycle,
			activeMesocycleTemplate
		};
	}

	const { _id, templateMesoId, workouts, startTimestamp } = activeMesocycleDocument;
	activeMesocycle = {
		id: _id.toString(),
		templateMesoId: templateMesoId.toString(),
		workouts: workouts.map((workout) => workout.toString()),
		startTimestamp
	};

	const activeMesocycleTemplateDocument = (await client
		.db()
		.collection<Omit<MesocycleTemplateDocument, "userId">>("mesocycleTemplates")
		.findOne(
			{ _id: new ObjectId(activeMesocycle.templateMesoId) },
			{ projection: { userId: 0 } }
		)) as WithId<Omit<MesocycleTemplateDocument, "userId">>;

	{
		const { _id, ...otherProps } = activeMesocycleTemplateDocument;
		activeMesocycleTemplate = {
			id: activeMesocycleTemplateDocument._id.toString(),
			...otherProps
		};
	}

	return {
		session,
		activeMesocycle,
		activeMesocycleTemplate
	};
};
