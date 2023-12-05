import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import clientPromise from "$lib/mongo/mongodb";
import type {
	MesocycleDocument,
	WorkoutDocument,
	MesocycleTemplateDocument
} from "$lib/types/documents";
import { ObjectId } from "mongodb";

export const load: PageServerLoad = async ({ locals, params }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		throw error(403, "Not logged in");
	}

	if (params.workoutId.length !== 24) {
		throw error(400, "Workout ID should be 24 character hex string");
	}

	const client = await clientPromise;
	const workoutDocument = await client
		.db()
		.collection<Omit<WorkoutDocument, "userId">>("workouts")
		.findOne(
			{ userId: new ObjectId(session.user.id), _id: new ObjectId(params.workoutId) },
			{ projection: { userId: 0 } }
		);

	if (!workoutDocument) {
		throw error(404, "Workout not found");
	}
	const { _id, performedMesocycleId, ...workout } = workoutDocument;
	return { workout };
};
