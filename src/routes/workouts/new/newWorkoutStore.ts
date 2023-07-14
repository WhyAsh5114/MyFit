import { writable, type Writable } from "svelte/store";

export const workoutDay: Writable<number> = writable();
export const plannedRIR: Writable<number> = writable();
export const muscleTargetsAndSets: Writable<Record<string, number>> = writable();
export const weekNumber: Writable<number> = writable();
