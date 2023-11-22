import clientPromise from "$lib/mongo/mongodb";
import type { UserPreferencesDocument, WorkoutDocument } from "$lib/types/documents";
import { getTodaysSplitWorkout } from "$lib/util/MesocycleTemplate";
import { ObjectId } from "mongodb";
import type { LayoutServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ locals, parent, fetch, depends }) => {
	depends("user:preferences");

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

	const todaysWorkout = getTodaysSplitWorkout(
		activeMesocycle.workouts,
		activeMesocycleTemplate.exerciseSplit
	);

	let referenceWorkout: Workout | null = null;
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
			referenceWorkout = referenceWorkoutDocument;
		}
	}

	return {
		activeMesocycle,
		activeMesocycleTemplate,
		referenceWorkout,
		userBodyweight: userPreferences?.bodyweight || null
	};
};
