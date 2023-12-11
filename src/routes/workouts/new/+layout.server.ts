import { getDayNumber, getTodaysSplitWorkout } from "$lib/util/MesocycleTemplate";
import { error } from "@sveltejs/kit";

export const load = async ({ locals, parent, fetch, depends }) => {
  depends("user:preferences");

  const session = await locals.getSession();
  if (!session?.user?.id) {
    throw error(403, "Not logged in");
  }

  const { activeMesocycle, activeMesocycleTemplate } = await parent();
  if (!activeMesocycle || !activeMesocycleTemplate) {
    throw error(404, "No active mesocycle found");
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
    const requestBody: APIWorkoutsGetReferenceWorkout = {
        workoutDayNumber: getDayNumber(
          activeMesocycle.workouts,
          activeMesocycleTemplate.exerciseSplit
        )
      },
      response = await fetch("/api/workouts/getReferenceWorkout", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "content-type": "application/json"
        }
      });
    if (response.ok) {
      referenceWorkout = await response.json();
    }
  }

  return {
    activeMesocycle,
    activeMesocycleTemplate,
    referenceWorkout,
    userBodyweight: userPreferences?.bodyweight || null
  };
};
