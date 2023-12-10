import { error } from "@sveltejs/kit";
import { getMuscleGroups } from "$lib/util/MesocycleTemplate";

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
    },
    responseSoreness = await fetch("/api/workouts/getPreviousSorenessValues", {
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
      await responseSoreness.json(),
    requestBody: APIGetWorkoutsThatPreviouslyTargeted = {
      mesocycleId: mesocycle.id,
      muscleGroups: Array.from(getMuscleGroups(workout.exercisesPerformed)),
      beforeTimestamp: workout.startTimestamp
    },
    response = await fetch("/api/workouts/getWorkoutsThatPreviouslyTargeted", {
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

  return { workout, previousWorkoutSorenessValues, workoutsThatPreviouslyTargeted };
};
