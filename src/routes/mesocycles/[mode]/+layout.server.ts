import { error } from "@sveltejs/kit";

export const load = async ({ params, locals, url, fetch }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    error(403, "Not logged in");
  }

  let mesocycleTemplate: WithSerializedId<MesocycleTemplate> | undefined = undefined;

  if (params.mode === "newTemplate") {
    return { mesocycleTemplate };
  } else if (params.mode !== "editTemplate") {
    error(400, "Invalid mode");
  }

  const mesocycleTemplateId = url.searchParams.get("mesocycleTemplateId");
  if (mesocycleTemplateId === null) {
    error(400, "No mesocycle template ID given");
  } else if (mesocycleTemplateId.length !== 24) {
    error(400, "Mesocycle template ID should be 24 character hex string");
  }

  const getMesocycleTemplateResponse = await fetch(
    "/api/mesocycles/getMesocycleTemplate?mesocycleTemplateId=" + mesocycleTemplateId
  );
  if (getMesocycleTemplateResponse.ok) {
    mesocycleTemplate = await getMesocycleTemplateResponse.json();
  }

  return { mesocycleTemplate };
};
