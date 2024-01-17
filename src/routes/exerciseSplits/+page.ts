export const load = async ({ fetch }) => {
  let exerciseSplits: WithSID<ExerciseSplit>[] = [];

  const response = await fetch("/api/exerciseSplits");
  if (response.ok) {
    exerciseSplits = (await response.json()) as WithSID<ExerciseSplit>[];
  }
  return { exerciseSplits };
};
