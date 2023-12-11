import { error } from "@sveltejs/kit";

export const load = async ({ locals, params, fetch }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    throw error(403, "Not logged in");
  }

  if (params.mesocycleId.length !== 24) {
    throw error(400, "Mesocycle template ID should be 24 character hex string");
  }

  let mesocycle: WithSerializedId<Mesocycle> | null = null;
  const getMesocycleResponse = await fetch(
    "/api/mesocycles/getMesocycle?mesocycleId=" + params.mesocycleId
  );
  if (getMesocycleResponse.ok) {
    mesocycle = (await getMesocycleResponse.json()) as WithSerializedId<Mesocycle>;
  } else {
    throw error(404, "Mesocycle not found");
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
    "/api/workouts/getAllWorkouts?page=0&mesocycleId=" + mesocycle._id
  );
  if (getAllWorkoutsResponse.ok) {
    ({ workouts, workoutsCount } = await getAllWorkoutsResponse.json());
  }

  return { mesocycle, mesocycleTemplate, workouts, workoutsCount };
};
