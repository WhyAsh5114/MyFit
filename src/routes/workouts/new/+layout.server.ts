import clientPromise from "$lib/mongo/mongodb";
import type { UserPreferencesDocument, WorkoutDocument } from "$lib/types/documents";
import { getDayNumber, getTodaysSplitWorkout } from "$lib/util/MesocycleTemplate";
import { ObjectId, type WithId } from "mongodb";
import { error } from "@sveltejs/kit";

export const load = async ({ locals, parent, fetch, depends }) => {
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
  const todaysSplitWorkout = getTodaysSplitWorkout(
    activeMesocycle.workouts,
    activeMesocycleTemplate.exerciseSplit
  );

  let referenceWorkout: WithId<WorkoutDocument> | null = null;
  if (todaysSplitWorkout) {
    const requestBody: APIWorkoutsGetReferenceWorkout = {
      workoutDayNumber: getDayNumber(
        activeMesocycle.workouts,
        activeMesocycleTemplate.exerciseSplit
      )
    };
    const response = await fetch("/api/workouts/getReferenceWorkout", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "content-type": "application/json"
      }
    });
    if (response.ok) {
      const referenceWorkoutDocument: WithId<WorkoutDocument> = await response.json();
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
