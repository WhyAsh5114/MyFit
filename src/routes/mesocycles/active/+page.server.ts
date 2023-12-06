import clientPromise from "$lib/mongo/mongodb";
import type { WorkoutDocument } from "$lib/types/documents";
import { ObjectId } from "mongodb";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals, parent }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		throw error(403, "Not logged in");
	}

	const { activeMesocycle, activeMesocycleTemplate } = await parent();
	if (!activeMesocycle) {
		throw error(404, "No active mesocycle found");
	}

	const client = await clientPromise;
	const workoutsCursor = client
		.db()
		.collection<Omit<WorkoutDocument, "userId">>("workouts")
		.find(
			{
				userId: new ObjectId(session.user.id),
				performedMesocycleId: new ObjectId(activeMesocycle.id)
			},
			{ projection: { userId: 0 }, sort: { startTimestamp: -1 } }
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
		activeMesocycle,
		activeMesocycleTemplate,
		streamed: { workoutsStreamArray }
	};
};
