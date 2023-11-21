import clientPromise from "$lib/mongo/mongodb";
import type { UserPreferencesDocument, WorkoutDocument } from "$lib/types/documents";
import { getTodaysWorkout } from "$lib/util/MesocycleTemplate";
import { ObjectId } from "mongodb";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals, parent, fetch }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		throw error(403, "Not logged in");
	}

	const { activeMesocycle, activeMesocycleTemplate } = await parent();
	if (!activeMesocycle) {
		throw error(404, "No active mesocycle found");
	}

	const client = await clientPromise;
	const userPreferences = await client
		.db()
		.collection<Omit<UserPreferencesDocument, "userId">>("userPreferences")
		.findOne({ userId: new ObjectId(session.user.id) }, { projection: { _id: 0, userId: 0 } });

	const { workout: todaysWorkout } = getTodaysWorkout(
		activeMesocycle.workouts,
		activeMesocycleTemplate.exerciseSplit
	);

	let referenceWorkoutTimestamp: EpochTimeStamp | null = null;
	if (todaysWorkout) {
		const requestBody: APIWorkoutsGetReferenceWorkout = { workoutName: todaysWorkout.name };
		const response = await fetch("/api/workouts/getReferenceWorkout", {
			method: "POST",
			body: JSON.stringify(requestBody),
			headers: {
				"content-type": "application/json"
			}
		});
		if (response.ok) {
			const referenceWorkoutDocument: WorkoutDocument = await response.json();
			referenceWorkoutTimestamp = referenceWorkoutDocument.startTimestamp;
		}
	}

	return {
		activeMesocycle,
		activeMesocycleTemplate,
		referenceWorkoutTimestamp,
		userPreferences
	};
};
