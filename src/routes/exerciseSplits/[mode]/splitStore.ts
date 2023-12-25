import { persisted } from "svelte-persisted-store";
import type { Writable } from "svelte/store";

export const splitName = persisted("splitName", "");
export const splitStructure: Writable<(string | null)[]> = persisted(
  "splitStructure",
  Array(7).fill("")
);
export const exerciseSplit: Writable<ExerciseSplit> = persisted("exerciseSplit", []);
