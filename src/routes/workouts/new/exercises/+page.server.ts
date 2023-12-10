import { error } from "@sveltejs/kit";
import {
  getCycleNumber,
  getDayNumber,
  getMuscleGroups,
  getPlannedRIR,
  getTodaysSplitWorkout
} from "$lib/util/MesocycleTemplate";
import { applyProgressiveOverload } from "$lib/util/ProgressiveOverload";
import { splitExercisesToWorkoutExercise } from "$lib/util/CommonFunctions";

export const load = async ({ locals, parent, fetch }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    throw error(403, "Not logged in");
  }

  const { activeMesocycle, activeMesocycleTemplate, referenceWorkout, userBodyweight } =
      await parent(),
    todaysSplitWorkout = getTodaysSplitWorkout(
      activeMesocycle.workouts,
      activeMesocycleTemplate.exerciseSplit
    );
  if (todaysSplitWorkout === null) {
    throw error(400, "No workout found for today");
  }

  const todaysWorkout: Partial<WorkoutBeingPerformed> = {
    startTimestamp: Number(new Date()),
    referenceWorkout: null,
    dayNumber: getDayNumber(activeMesocycle.workouts, activeMesocycleTemplate.exerciseSplit),
    cycleNumber: getCycleNumber(activeMesocycleTemplate.exerciseSplit, activeMesocycle.workouts),
    plannedRIR: getPlannedRIR(activeMesocycleTemplate, activeMesocycle.workouts),
    deload: false
  };

  if (referenceWorkout) {
    todaysWorkout.exercisesPerformed = applyProgressiveOverload(
      referenceWorkout.exercisesPerformed,
      userBodyweight,
      todaysWorkout.plannedRIR
    );
    todaysWorkout.referenceWorkout = referenceWorkout._id.toString();
  } else {
    todaysWorkout.exercisesPerformed = splitExercisesToWorkoutExercise(
      todaysSplitWorkout.exercises,
      userBodyweight ?? -1,
      getPlannedRIR(activeMesocycleTemplate, activeMesocycle.workouts)
    );
  }

  const requestBody: APIGetWorkoutsThatPreviouslyTargeted = {
      mesocycleId: activeMesocycle.id,
      muscleGroups: Array.from(getMuscleGroups(todaysSplitWorkout.exercises)),
      beforeTimestamp: Number(new Date())
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

  const workoutsThatPreviouslyTargeted = await response.json();

  return {
    activeMesocycle,
    activeMesocycleTemplate,
    todaysWorkout: todaysWorkout as WorkoutBeingPerformed,
    workoutsThatPreviouslyTargeted,
    todaysSplitWorkout
  };
};
