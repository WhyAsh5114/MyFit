export function dateFormatter(timestamp: number | undefined) {
  if (timestamp === undefined) timestamp = 0;
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export const groupBy = <T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => string
) =>
  array.reduce(
    (acc, value, index, array) => {
      const v = { ...value, idx: index };
      (acc[predicate(value, index, array)] ||= []).push(v);
      return acc;
    },
    {} as { [key: string]: (T & { idx: number })[] }
  );

export function splitExercisesToWorkoutExercise(
  exercises: SplitExercise[],
  userBodyweight: number | null = null,
  plannedRIR: number | null = null
) {
  const workoutExercises: WorkoutExerciseWithoutSetNumbers[] = [];
  exercises.forEach(({ sets, weightType, ...splitExerciseProps }) => {
    const workoutExercise: WorkoutExerciseWithoutSetNumbers = {
      ...splitExerciseProps,
      jointPainRating: null,
      pumpRating: null,
      sets: Array(sets)
        .fill(undefined)
        .map(() => {
          return { reps: null, load: null, RIR: plannedRIR };
        }),
      bodyweight: weightType === "Bodyweight" ? userBodyweight ?? undefined : undefined
    };
    workoutExercises.push(workoutExercise);
  });
  return workoutExercises;
}

export function range(start: number, stop: number | undefined, step: number | undefined) {
  if (typeof stop == "undefined") {
    stop = start;
    start = 0;
  }
  if (typeof step == "undefined") step = 1;
  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) return [];
  let result = [];
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) result.push(i);
  return result;
}

export function addAlpha(color: string, opacity: number) {
  let _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
  return color + _opacity.toString(16).toUpperCase();
}
