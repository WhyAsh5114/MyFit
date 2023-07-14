import { writable, type Writable } from "svelte/store";

export const workoutDay: Writable<number> = writable();
export const plannedRIR: Writable<number> = writable();
