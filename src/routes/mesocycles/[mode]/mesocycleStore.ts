import { persisted } from "svelte-persisted-store";
import type { Writable } from "svelte/store";
import { muscleGroups } from "$lib/types/arrays";

export const mesocycleName = persisted("mesocycleName", "");
export const mesocycleCaloricState: Writable<CaloricStateValue> = persisted(
  "mesocycleCaloricState",
  0
);
export const mesocycleDuration = persisted("mesocycleDuration", 6);
export const mesocycleStartRIR = persisted("mesocycleStartRIR", 3);
export const customizeRIRProgression = persisted("customizeRIRProgression", false);
export const selectedSplitId: Writable<null | string> = persisted("selectedSplitId", null);

export const remainingMuscleGroups = persisted("remainingMuscleGroups", muscleGroups.slice());
export const useSpecializations = persisted("useSpecializations", false);
export const primarySpecializations: Writable<MuscleGroup[]> = persisted(
  "primarySpecializations",
  []
);
export const secondarySpecializations: Writable<MuscleGroup[]> = persisted(
  "secondarySpecializations",
  []
);
