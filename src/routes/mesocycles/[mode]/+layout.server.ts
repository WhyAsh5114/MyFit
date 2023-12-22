import { error } from "@sveltejs/kit";

export const load = async ({ params, locals, url, fetch, untrack }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    error(403, "Not logged in");
  }

  let mesocycleTemplate: WithSerializedId<MesocycleTemplate> | undefined = undefined;

  if (params.mode === "newTemplate") {
    return { mesocycleTemplate, mode: "newTemplate" };
  } else if (params.mode !== "editTemplate") {
    error(400, "Invalid mode");
  }

  // Only run if editing and on basics page
  // Subsequent pages (split, exercises, extras) don't need this load function to rerun
  if (untrack(() => !url.pathname.startsWith("/mesocycles/editTemplate/basics"))) {
    return { mode: params.mode };
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

  return { mesocycleTemplate, mode: "editTemplate" };
};
