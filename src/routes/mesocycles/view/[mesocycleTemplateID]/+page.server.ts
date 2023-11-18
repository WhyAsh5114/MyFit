import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import clientPromise from "$lib/mongo/mongodb";
import { ObjectId } from "mongodb";

export const load: PageServerLoad = async ({ locals, params }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		throw error(403, "Not logged in");
	}

	if (params.mesocycleTemplateId.length !== 24) {
		throw error(400, "Mesocycle template ID should be 24 character hex string");
	}

	const client = await clientPromise;
	const mesocycleTemplateDocument = await client
		.db()
		.collection<MesocycleTemplate & { userId: ObjectId }>("mesocycleTemplates")
		.findOne({ _id: new ObjectId(params.mesocycleTemplateId) });

	if (mesocycleTemplateDocument === null) {
		throw error(404, "Mesocycle not found");
	} else if (mesocycleTemplateDocument.userId.toString() !== session.user.id) {
		throw error(403, "Unauthorized");
	}

	const { _id, userId, ...mesocycleTemplateProps } = mesocycleTemplateDocument;
	const mesocycleTemplate: MesocycleTemplate = { ...mesocycleTemplateProps };
	return { mesocycleTemplate };
};
