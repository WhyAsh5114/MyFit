import { error, type NumericRange } from "@sveltejs/kit";

export const load = async ({ url, params, fetch }) => {
  const mode = params.mode;
  if (mode !== "new" && mode !== "edit") {
    error(404, "Not found");
  }

  const editId = url.searchParams.get("editId");
  const cloneId = url.searchParams.get("cloneId");
  const commonIdx = parseInt(url.searchParams.get("commonIdx") ?? "");

  if (editId) {
    const response = await fetch(`/api/exerciseSplits/${editId}`);
    if (response.ok) {
      const exerciseSplit = (await response.json()) as WithSID<ExerciseSplit>;
      return { template: exerciseSplit, editingSplitId: editId };
    }
    const errorCode = response.status as NumericRange<400, 599>;
    error(errorCode, await response.text());
  } else if (cloneId) {
    // TODO: fetch split to clone from, and return it
  } else if (Number.isInteger(commonIdx)) {
    const { commonSplits } = await import("$lib/commonMesocycles.js");
    return { template: commonSplits[commonIdx], editingSplitId: null };
  } else {
    return { template: null, editingSplitId: null };
  }
};
