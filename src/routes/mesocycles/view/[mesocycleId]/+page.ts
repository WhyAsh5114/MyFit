import { error } from "@sveltejs/kit";

export const load = async ({ params, fetch }) => {
  if (params.mesocycleId.length !== 24) {
    error(400, "Mesocycle template ID should be 24 character hex string");
  }

  let mesocycle: WithSerializedId<Mesocycle> | null = null;
  const getMesocycleResponse = await fetch(
    "/api/mesocycles/getMesocycle?mesocycleId=" + params.mesocycleId
  );
  if (getMesocycleResponse.ok) {
    mesocycle = (await getMesocycleResponse.json()) as WithSerializedId<Mesocycle>;
  } else {
    error(404, "Mesocycle not found");
  }

  let mesocycleTemplate: WithSerializedId<MesocycleTemplate> | null = null;
  const getMesocycleTemplateResponse = await fetch(
    "/api/mesocycles/getMesocycleTemplate?mesocycleTemplateId=" + mesocycle.templateMesoId
  );
  if (getMesocycleTemplateResponse.ok) {
    mesocycleTemplate = await getMesocycleTemplateResponse.json();
  }

  let workouts: WithSerializedId<Workout>[] = [];
  let workoutsCount = 0;
  const getAllWorkoutsResponse = await fetch(
    "/api/workouts/getAllWorkouts?mesocycleId=" + mesocycle._id
  );
  if (getAllWorkoutsResponse.ok) {
    ({ workouts, workoutsCount } = await getAllWorkoutsResponse.json());
  }
  workouts.reverse();

  return { mesocycle, mesocycleTemplate, workouts, workoutsCount };
};
