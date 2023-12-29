import { error } from "@sveltejs/kit";

export const load = async ({ url, params }) => {
  if (params.mode === "edit") {
    const editId = url.searchParams.get("editId");
    if (!editId) {
      error(400, "No exercise split ID given to edit");
    }
    // TODO: Load split to edit into stores and return it
  }

  if (params.mode !== "new") error(404, "Not found");
  let template = null;

  const cloneId = url.searchParams.get("cloneId");
  if (cloneId) {
    // TODO: fetch split to clone from, and return it
  }

  const commonIdx = parseInt(url.searchParams.get("commonIdx") ?? "");
  if (Number.isInteger(commonIdx)) {
    const { commonSplits } = await import("$lib/commonMesocycles.js");
    template = commonSplits[commonIdx];
  }

  return { template, mode: params.mode };
};
