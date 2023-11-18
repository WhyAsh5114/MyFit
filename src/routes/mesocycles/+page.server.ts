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
		.collection<MesocycleTemplate>("mesocycleTemplates")
		.find(
			{
				userId: new ObjectId(session.user.id)
			},
			{
				projection: {
					_id: 0,
					userId: 0
				}
			}
		);

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
