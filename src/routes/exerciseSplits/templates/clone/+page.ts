import { error, type NumericRange } from "@sveltejs/kit";

export const load = async ({ fetch }) => {
  const response = await fetch("/api/exerciseSplits");
  if (!response.ok) {
    const errorCode = response.status as NumericRange<400, 599>;
    error(errorCode, await response.text());
  }

  const exerciseSplits: WithSID<ExerciseSplit>[] = await response.json();
  return { exerciseSplits };
};
