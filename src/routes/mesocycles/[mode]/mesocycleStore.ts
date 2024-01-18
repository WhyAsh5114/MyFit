import { persisted } from "svelte-persisted-store";
import { type Writable } from "svelte/store";
import { muscleGroups } from "$lib/types/arrays";

export const mesocycleName = persisted("mesocycleName", "");
export const mesocycleCaloricState: Writable<CaloricStateValue> = persisted(
  "mesocycleCaloricState",
  0
);
export const mesocycleDuration = persisted("mesocycleDuration", 6);
export const mesocycleStartRIR = persisted("mesocycleStartRIR", 3);
export const customizeRIRProgression = persisted("customizeRIRProgression", false);
export const mesocycleRIRProgression: Writable<Mesocycle["RIRProgression"]> = persisted(
  "mesocycleRIRProgression",
  Array.from({ length: 3 }, (_, idx) => ({ specificRIR: idx, cycles: 0 }))
);

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
export const startMesocycleNow: Writable<boolean> = persisted("startMesocycleNow", false);

export function clearStores() {
  mesocycleName.set("");
  mesocycleCaloricState.set(0);
  mesocycleDuration.set(6);
  mesocycleStartRIR.set(3);
  customizeRIRProgression.set(false);
  mesocycleRIRProgression.set(
    Array.from({ length: 3 }, (_, idx) => ({ specificRIR: idx, cycles: 0 }))
  );
  selectedSplitId.set(null);
  remainingMuscleGroups.set(muscleGroups.slice());
  useSpecializations.set(false);
  primarySpecializations.set([]);
  secondarySpecializations.set([]);
  startMesocycleNow.set(false);
}

// TODO: export function for setting store
