import { error, type NumericRange } from "@sveltejs/kit";

export const load = async ({ params, fetch }) => {
  const mesocycleId = params.id;
  const response = await fetch(`/api/mesocycles/${mesocycleId}`);

  if (response.ok) {
    const mesocycle = (await response.json()) as WithSID<Mesocycle>;
    const exerciseSplitResponse = await fetch(`/api/exerciseSplits/${mesocycle.exerciseSplitId}`);
    if (!exerciseSplitResponse.ok) {
      const statusCode = response.status as NumericRange<400, 599>;
      error(statusCode, await response.text());
    }
    const exerciseSplit = (await exerciseSplitResponse.json()) as WithSID<ExerciseSplit>;
    return { mesocycle, exerciseSplit };
  } else {
    const statusCode = response.status as NumericRange<400, 599>;
    error(statusCode, await response.text());
  }
};
