import { error } from "@sveltejs/kit";

export const load = async ({ locals, params, fetch }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    throw error(403, "Not logged in");
  }

  let workout: WithSerializedId<Workout> | null = null;
  const getWorkoutResponse = await fetch("/api/workouts/getWorkout?workoutId=" + params.workoutId);
  if (getWorkoutResponse.ok) {
    workout = (await getWorkoutResponse.json()) as WithSerializedId<Workout>;
  } else {
    throw error(404, "Workout not found");
  }

  let mesocycle: WithSerializedId<Mesocycle> | null = null;
  const getMesocycleResponse = await fetch(
    "/api/mesocycles/getMesocycle?mesocycleId=" + workout.performedMesocycleId
  );
  if (getMesocycleResponse.ok) mesocycle = await getMesocycleResponse.json();

  let mesocycleTemplate: WithSerializedId<MesocycleTemplate> | null = null;
  if (mesocycle) {
    const getMesocycleTemplateResponse = await fetch(
      "/api/mesocycles/getMesocycleTemplate?mesocycleTemplateId=" + mesocycle.templateMesoId
    );
    if (getMesocycleTemplateResponse.ok)
      mesocycleTemplate = await getMesocycleTemplateResponse.json();
  }

  let referenceWorkout: WithSerializedId<Workout> | null = null;
  const getReferenceWorkoutResponse = await fetch(
    "/api/workouts/getReferenceWorkout?workoutDayNumber=" + workout.dayNumber
  );
  if (getReferenceWorkoutResponse.ok) referenceWorkout = await getReferenceWorkoutResponse.json();

  return { workout, mesocycle, mesocycleTemplate, referenceWorkout };
};
