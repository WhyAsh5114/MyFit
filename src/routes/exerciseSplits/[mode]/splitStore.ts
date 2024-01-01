import { persisted } from "svelte-persisted-store";
import type { Writable } from "svelte/store";

export const splitName = persisted("splitName", "");
export const splitStructure: Writable<(string | null)[]> = persisted(
  "splitStructure",
  Array(7).fill("")
);
export const exerciseSplitDays: Writable<ExerciseSplit["splitDays"]> = persisted(
  "exerciseSplit",
  []
);
export const editingSplitId: Writable<string | null> = persisted("editingSplitId", null);

export function clearExerciseSplitStores() {
  splitName.set("");
  splitStructure.set(Array(7).fill(""));
  exerciseSplitDays.set([]);
}

export function setExerciseSplitStores(exerciseSplit: ExerciseSplit) {
  splitName.set(exerciseSplit.name);
  splitStructure.set(exerciseSplit.splitDays.map((splitDay) => splitDay?.name ?? null));
  exerciseSplitDays.set(exerciseSplit.splitDays);
}
