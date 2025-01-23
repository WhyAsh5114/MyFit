import { error } from "@sveltejs/kit";
import { getMuscleGroups } from "$lib/util/MesocycleTemplate";
import clientPromise from "$lib/mongo/mongodb";
import type { UserPreferencesDocument, WorkoutDocument } from "$lib/types/documents";
import { ObjectId } from "mongodb";

export const load = async ({ locals, parent, fetch }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    throw error(403, "Not logged in");
  }

  const { workout, mesocycle } = await parent();
  if (!mesocycle) {
    throw error(500, "No mesocycle found");
  }

  const requestBodySoreness: APIGetPreviousSorenessValues = {
    mesocycleId: mesocycle.id,
    muscleGroups: Array.from(getMuscleGroups(workout.exercisesPerformed)),
    beforeTimestamp: workout.startTimestamp
  };
  const responseSoreness = await fetch("/api/workouts/getPreviousSorenessValues", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(requestBodySoreness)
  });
  if (!responseSoreness.ok) {
    throw error(500, await responseSoreness.text());
  }

  const previousWorkoutSorenessValues: Workout["muscleSorenessToNextWorkout"] =
    await responseSoreness.json();
  const requestBody: APIGetWorkoutsThatPreviouslyTargeted = {
    mesocycleId: mesocycle.id,
    muscleGroups: Array.from(getMuscleGroups(workout.exercisesPerformed)),
    beforeTimestamp: workout.startTimestamp
  };
  const response = await fetch("/api/workouts/getWorkoutsThatPreviouslyTargeted", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });
  if (!response.ok) {
    throw error(500, await response.text());
  }

  const workoutsThatPreviouslyTargeted: APIGetWorkoutsThatPreviouslyTargetedResponse =
    await response.json();

  const client = await clientPromise;
  const userPreferences = await client
    .db()
    .collection<Omit<UserPreferencesDocument, "userId">>("userPreferences")
    .findOne({ userId: new ObjectId(session.user.id) }, { projection: { _id: 0, userId: 0 } });

  let referenceWorkout = null;
  if (workout.referenceWorkout) {
    referenceWorkout = JSON.parse(
      JSON.stringify(
        await client
          .db()
          .collection<WorkoutDocument>("workouts")
          .findOne({ _id: new ObjectId(workout.referenceWorkout) })
      )
    );
  }

  return {
    workout,
    referenceWorkout,
    previousWorkoutSorenessValues,
    workoutsThatPreviouslyTargeted,
    userBodyweight: userPreferences?.bodyweight || null
  };
};
