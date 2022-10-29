import { writable, type Writable } from 'svelte/store';

export const WorkoutName: Writable<string> = writable();
export const WorkoutExercises: Writable<Exercise[]> = writable();
export const WorkoutCreatedDate: Writable<Date> = writable();
export const OldWorkoutExercises: Writable<Exercise[]> = writable();
export const SetSplit: Writable<string> = writable();
export const SetWorkoutType: Writable<string> = writable();
