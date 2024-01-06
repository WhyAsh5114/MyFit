import { error } from "@sveltejs/kit";

export const load = async ({ params }) => {
  const mode = params.mode;
  if (mode !== "new" && mode !== "edit") {
    error(404, "Not found");
  }

  let template: Mesocycle | null = null;
  if (mode === "edit") {
    // TODO: load mesocycle here
    template = null;
  }

  return { template };
};
