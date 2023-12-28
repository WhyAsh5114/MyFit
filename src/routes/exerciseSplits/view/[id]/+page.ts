import { error, type NumericRange } from "@sveltejs/kit";

export const load = async ({ params, fetch }) => {
  const exerciseSplitId = params.id;
  const response = await fetch(`/api/exerciseSplits/${exerciseSplitId}`);

  if (response.ok) {
    const exerciseSplit = (await response.json()) as ExerciseSplit;
    return { exerciseSplit };
  } else {
    const statusCode = response.status as NumericRange<400, 599>;
    error(statusCode, await response.text());
  }
};
