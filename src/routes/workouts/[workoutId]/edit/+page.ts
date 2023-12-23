import { error } from "@sveltejs/kit";
import { getMuscleGroups } from "$lib/util/MesocycleTemplate";

export const load = async ({ parent, fetch }) => {
  const { workout, mesocycle } = await parent();
  if (!mesocycle) {
    error(500, "No mesocycle found");
  }

  const requestBodySoreness: APIGetPreviousSorenessValues = {
    mesocycleId: mesocycle._id,
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
    error(500, await responseSoreness.text());
  }

  const previousWorkoutSorenessValues: Workout["muscleSorenessToNextWorkout"] =
    await responseSoreness.json();
  const requestBody: APIGetWorkoutsThatPreviouslyTargeted = {
    mesocycleId: mesocycle._id,
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
    error(500, await response.text());
  }

  const workoutsThatPreviouslyTargeted: APIGetWorkoutsThatPreviouslyTargetedResponse =
    await response.json();

  return { workout, previousWorkoutSorenessValues, workoutsThatPreviouslyTargeted };
};
