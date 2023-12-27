export const load = async ({ fetch }) => {
  const response = await fetch("/api/exerciseSplits");
  if (response.ok) {
    return { exerciseSplits: (await response.json()) as ExerciseSplit[] };
  }
  return { exerciseSplits: [] };
};
