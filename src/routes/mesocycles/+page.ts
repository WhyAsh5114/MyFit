export const load = async ({ parent, fetch }) => {
  const { activeMesocycle, activeMesocycleTemplate } = await parent();
  const getAllMesocycleTemplatesResponse = await fetch(
    "/api/mesocycles/getAllMesocycleTemplates?page=0"
  );
  const { mesocycleTemplates, mesocycleTemplatesCount } =
    await getAllMesocycleTemplatesResponse.json();

  return {
    activeMesocycle,
    activeMesocycleTemplate,
    mesocycleTemplates,
    mesocycleTemplatesCount
  };
};
