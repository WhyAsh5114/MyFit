import { error } from "@sveltejs/kit";

export const load = async ({ params, fetch }) => {
  if (params.mesocycleTemplateId.length !== 24) {
    error(400, "Mesocycle template ID should be 24 character hex string");
  }

  let mesocycleTemplate: WithSerializedId<MesocycleTemplate> | null = null;
  const getMesocycleTemplateResponse = await fetch(
    "/api/mesocycles/getMesocycleTemplate?mesocycleTemplateId=" + params.mesocycleTemplateId
  );
  if (getMesocycleTemplateResponse.ok) {
    mesocycleTemplate =
      (await getMesocycleTemplateResponse.json()) as WithSerializedId<MesocycleTemplate>;
  } else {
    error(404, "Mesocycle template not found");
  }

  let mesocycles: WithSerializedId<Mesocycle>[] = [];
  const getAllMesocyclesResponse = await fetch(
    "/api/mesocycles/getAllMesocycles?mesocycleTemplateId=" + params.mesocycleTemplateId
  );
  if (getAllMesocyclesResponse.ok) {
    // No need to use count and paging, won't be as many usages of each template
    ({ mesocycles } = await getAllMesocyclesResponse.json());
  }

  return { mesocycleTemplate, mesocycles };
};
