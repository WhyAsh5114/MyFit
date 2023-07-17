import { writable, type Writable } from 'svelte/store';

export const startTimestamp: Writable<EpochTimeStamp> = writable();
export const workoutDay: Writable<number> = writable();
export const plannedRIR: Writable<number> = writable();
export const muscleTargetsAndSets: Writable<Record<string, number>> = writable({});
export const weekNumber: Writable<number> = writable();
export const referenceWorkout: Writable<null | number> = writable(null);
export const workoutExercises: Writable<WorkoutExercise[]> = writable([]);
export const muscleWorkloads: Writable<Workout['muscleGroupWorkloads']> = writable();
export const musclesTargetedPreviously: Writable<MuscleToLastWorkout[]> = writable();
