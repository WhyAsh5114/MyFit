import { error, type NumericRange } from "@sveltejs/kit";

export const load = async ({ params, url, fetch }) => {
  const mode = params.mode;
  if (mode !== "new" && mode !== "edit") {
    error(404, "Not found");
  }

  const editId = url.searchParams.get("editId");
  if (editId) {
    const response = await fetch(`/api/mesocycles/${editId}`);
    if (response.ok) {
      const mesocycle = (await response.json()) as WithSID<Mesocycle>;
      return { template: mesocycle, editingMesocycleId: mesocycle._id };
    }
    const errorCode = response.status as NumericRange<400, 599>;
    error(errorCode, await response.text());
  }

  return {};
};
