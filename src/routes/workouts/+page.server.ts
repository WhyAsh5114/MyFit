import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import clientPromise from "$lib/mongo/mongodb";
import type { WorkoutDocument } from "$lib/types/documents";
import { ObjectId } from "mongodb";

export const load: PageServerLoad = async ({ depends, locals }) => {
	depends("workout:all");
	const session = await locals.getSession();
	if (!session?.user?.id) {
		throw error(403, "Not logged in");
	}

	const client = await clientPromise;
	const workoutsCursor = client
		.db()
		.collection<Omit<WorkoutDocument, "userId">>("workouts")
		.find(
			{ userId: new ObjectId(session.user.id) },
			{ sort: { startTimestamp: -1 }, projection: { userId: 0 } }
		)
		.map((workoutDocument) => {
			const { _id, performedMesocycleId, ...otherProps } = workoutDocument;
			const workout: WithSerializedId<Workout> & { performedMesocycleId: string } = {
				id: _id.toString(),
				performedMesocycleId: performedMesocycleId.toString(),
				...otherProps
			};
			return workout;
		});

	const workoutsStreamArray = [];
	while (await workoutsCursor.hasNext()) {
		workoutsStreamArray.push(workoutsCursor.next());
	}

	return {
		streamed: {
			workoutsStreamArray
		}
	};
};
