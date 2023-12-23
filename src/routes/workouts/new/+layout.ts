import { getDayNumber, getTodaysSplitWorkout } from "$lib/util/MesocycleTemplate";
import { error } from "@sveltejs/kit";

export const load = async ({ parent, fetch }) => {
  const { activeMesocycle, activeMesocycleTemplate } = await parent();
  if (!activeMesocycle || !activeMesocycleTemplate) {
    error(404, "No active mesocycle found");
  }

  const todaysWorkout = getTodaysSplitWorkout(
    activeMesocycle.workouts,
    activeMesocycleTemplate.exerciseSplit
  );

  let userPreferences: UserPreferences | null = null;
  const getUserPreferencesResponse = await fetch("/api/user/getPreferences");
  if (getUserPreferencesResponse.ok) userPreferences = await getUserPreferencesResponse.json();

  let referenceWorkout: WithSerializedId<Workout> | null = null;
  if (todaysWorkout) {
    const getReferenceWorkoutResponse = await fetch(
      "/api/workouts/getReferenceWorkout?workoutDayNumber=" +
        getDayNumber(activeMesocycle.workouts, activeMesocycleTemplate.exerciseSplit)
    );
    if (getReferenceWorkoutResponse.ok) {
      referenceWorkout = await getReferenceWorkoutResponse.json();
    }
  }

  return {
    activeMesocycle,
    activeMesocycleTemplate,
    referenceWorkout,
    userBodyweight: userPreferences?.bodyweight || null
  };
};
