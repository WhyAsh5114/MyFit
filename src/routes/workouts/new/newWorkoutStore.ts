import { type Writable } from "svelte/store";
import { persisted } from "svelte-persisted-store";

export const workoutBeingPerformed: Writable<WorkoutBeingPerformed | null> = persisted(
  "workoutBeingPerformed",
  null
);
export const exercisesPerformed: Writable<WorkoutExerciseWithoutSetNumbers[] | null> = persisted(
  "exercisesPerformed",
  null
);
export const allExercisesSetsCompleted: Writable<boolean[][]> = persisted(
  "allExercisesSetsCompleted",
  []
);
export const workloadData: Writable<Workout["muscleGroupWorkloads"]> = persisted(
  "muscleGroupWorkloads",
  {}
);
export const sorenessData: Writable<Workout["muscleSorenessToNextWorkout"]> = persisted(
  "muscleSorenessToNextWorkout",
  {}
);
