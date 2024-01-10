export const load = async ({ fetch }) => {
  let mesocycles: WithSID<Mesocycle>[] = [];
  let exerciseSplits: WithSID<ExerciseSplit>[] = [];

  const response = await fetch("/api/mesocycles");
  if (response.ok) {
    mesocycles = (await response.json()) as WithSID<Mesocycle>[];
  }

  const splitsResponse = await fetch("/api/exerciseSplits");
  if (splitsResponse.ok) {
    exerciseSplits = (await splitsResponse.json()) as WithSID<ExerciseSplit>[];
  }

  return { mesocycles, exerciseSplits };
};
