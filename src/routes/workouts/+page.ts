export const load = async ({ fetch, parent }) => {
  const { activeMesocycle } = await parent();

  let params = "";
  if (activeMesocycle) {
    params += `activeMesocycle=${activeMesocycle._id}`;
  }

  const getAllMesocyclesResponse = await fetch("/api/mesocycles/getAllMesocycles");
  const { mesocycles } = await getAllMesocyclesResponse.json();

  const getAllMesocycleTemplatesResponse = await fetch("/api/mesocycles/getAllMesocycleTemplates");
  const { mesocycleTemplates } = await getAllMesocycleTemplatesResponse.json();

  const getAllWorkoutsResponse = await fetch("/api/workouts/getAllWorkouts?page=0" + params);
  const { workouts, workoutsCount } = await getAllWorkoutsResponse.json();

  return { mesocycles, mesocycleTemplates, workouts, workoutsCount };
};
