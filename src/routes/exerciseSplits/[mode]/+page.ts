import { error } from "@sveltejs/kit";

export const load = ({ url, params }) => {
  if (params.mode === "edit") {
    const editId = url.searchParams.get("editId");
    if (!editId) {
      error(400, "No exercise split ID given to edit");
    }
    // TODO: Load split to edit into stores and return it
  }

  if (params.mode !== "new") error(404, "Not found");

  const cloneId = url.searchParams.get("cloneId");
  if (cloneId) {
    // TODO: fetch split to clone from, and return it
  }

  const commonId = url.searchParams.get("commonId");
  if (commonId) {
    // TODO: dynamically import the split from $lib and return it
  }

  return { template: null, mode: params.mode };
};
