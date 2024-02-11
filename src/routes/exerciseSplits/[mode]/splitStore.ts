import { persisted } from "svelte-persisted-store";
import { get, type Writable } from "svelte/store";

export const defaultExerciseSplit = {
  name: "",
  splitDays: Array.from({ length: 7 }, () => ({ name: "", exerciseTemplates: [] }))
};

export const originalExerciseSplit: Writable<ExerciseSplit> = persisted(
  "originalExerciseSplit",
  JSON.parse(JSON.stringify(defaultExerciseSplit))
);
export const splitName = persisted("splitName", "");
export const splitStructure: Writable<(string | null)[]> = persisted(
  "splitStructure",
  Array(7).fill("")
);
export const exerciseSplitDays: Writable<ExerciseSplit["splitDays"]> = persisted(
  "exerciseSplitDays",
  Array.from({ length: 7 }, () => ({ name: "", exerciseTemplates: [] }))
);
export const editingSplitId: Writable<string | null> = persisted("editingSplitId", null);

export function setExerciseSplitStores(exerciseSplit: ExerciseSplit) {
  originalExerciseSplit.set(exerciseSplit);
  splitName.set(exerciseSplit.name);
  splitStructure.set(exerciseSplit.splitDays.map((splitDay) => splitDay?.name ?? null));
  exerciseSplitDays.set(exerciseSplit.splitDays);
}

export function didExerciseSplitStoresChange() {
  const exerciseSplit = get(originalExerciseSplit);
  const _splitStructure = exerciseSplit.splitDays.map((splitDay) => splitDay?.name ?? null);

  if (get(splitName) !== exerciseSplit.name) return true;
  if (JSON.stringify(get(splitStructure)) !== JSON.stringify(_splitStructure)) return true;
  if (JSON.stringify(get(exerciseSplitDays)) !== JSON.stringify(exerciseSplit.splitDays))
    return true;

  return false;
}
