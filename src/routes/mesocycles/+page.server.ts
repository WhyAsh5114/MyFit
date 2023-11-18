import type { PageServerLoad } from "./$types";
import clientPromise from "$lib/mongo/mongodb";
import { error } from "@sveltejs/kit";
import { ObjectId } from "mongodb";

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		throw error(403, "Not logged in");
	}

	const client = await clientPromise;
	const mesocycleTemplates = client
		.db()
		.collection<MesocycleTemplate & { userId: ObjectId }>("mesocycleTemplates")
		.find(
			{
				userId: new ObjectId(session.user.id)
			},
			{
				projection: {
					userId: 0
				},
				serializeFunctions: true
			}
		)
		.map((doc) => {
			const { _id, ...otherProps } = doc;
			const stringID = JSON.stringify(doc._id);
			const mesocycle: WithSerializedID<MesocycleTemplate> = {
				id: stringID,
				...otherProps
			};
			return mesocycle;
		});

	const streamArray = [];
	while (await mesocycleTemplates.hasNext()) {
		streamArray.push(mesocycleTemplates.next());
	}

	return {
		streamed: {
			streamArray
		}
	};
};
