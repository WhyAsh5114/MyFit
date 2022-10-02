import { type Writable, writable } from 'svelte/store';

export const CurrentSplit: Writable<Split> = writable();
export const SplitSchedule: Writable<string[]> = writable();
export const EditingWorkoutName: Writable<string> = writable();
export const EditingWorkout: Writable<Exercise[]> = writable();
export const EditedWorkouts: Writable<Record<string, Exercise[]>> = writable({});
