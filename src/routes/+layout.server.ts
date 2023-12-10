import { redirect } from "@sveltejs/kit";

const unprotectedRoutes = ["/", "/login"];

export const load = async ({ locals, url, fetch }) => {
  const session = await locals.getSession();

  if (!session && !unprotectedRoutes.includes(url.pathname)) {
    throw redirect(303, `/login?callbackURL=${url.pathname}`);
  }

  let activeMesocycle: WithSerializedId<ActiveMesocycle> | null = null,
    activeMesocycleTemplate: WithSerializedId<MesocycleTemplate> | null = null;
  if (!session?.user?.id) {
    return { session, activeMesocycle, activeMesocycleTemplate };
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

  return {
    session,
    activeMesocycle,
    activeMesocycleTemplate
  };
};
