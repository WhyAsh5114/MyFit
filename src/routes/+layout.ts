export const load = async ({ fetch, data }) => {
  const { session } = data;
  let activeMesocycle: WithSerializedId<ActiveMesocycle> | null = null;
  let activeMesocycleTemplate: WithSerializedId<MesocycleTemplate> | null = null;
  if (!session) {
    return {
      session,
      activeMesocycle,
      activeMesocycleTemplate
    };
  }

  const getActiveMesocycleResponse = await fetch("/api/mesocycles/getActiveMesocycle");
  if (getActiveMesocycleResponse.ok) {
    activeMesocycle = await getActiveMesocycleResponse.json();
  }

  const getActiveMesocycleTemplateResponse = await fetch(
    "/api/mesocycles/getActiveMesocycleTemplate"
  );
  if (getActiveMesocycleTemplateResponse.ok) {
    activeMesocycleTemplate = await getActiveMesocycleTemplateResponse.json();
  }

  return { session, activeMesocycle, activeMesocycleTemplate };
};
