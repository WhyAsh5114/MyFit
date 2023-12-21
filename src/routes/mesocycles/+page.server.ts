import { error } from "@sveltejs/kit";

export const load = async ({ locals, parent, fetch }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    error(403, "Not logged in");
  }

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
