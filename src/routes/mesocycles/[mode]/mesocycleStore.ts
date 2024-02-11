import { persisted } from "svelte-persisted-store";
import { get, type Writable } from "svelte/store";
import { muscleGroups } from "$lib/types/arrays";
import {
  getPrimarySpecializations,
  getSecondarySpecializations,
  getTotalDuration
} from "$lib/utils/mesocycle";

type StoreMesocycleType = {
  name: string;
  RIRProgression: Mesocycle["RIRProgression"];
  specializations: Mesocycle["specializations"];
  caloricBalance: Mesocycle["caloricBalance"];
  exerciseSplitId: Mesocycle["exerciseSplitId"] | null;
};

export const defaultMesocycle: StoreMesocycleType = {
  name: "",
  RIRProgression: [
    { specificRIR: 3, cycles: 2 },
    { specificRIR: 2, cycles: 2 },
    { specificRIR: 1, cycles: 1 },
    { specificRIR: 0, cycles: 1 }
  ],
  caloricBalance: 0,
  specializations: null,
  exerciseSplitId: null
};

export const originalMesocycle: Writable<StoreMesocycleType> = persisted(
  "originalMesocycle",
  JSON.parse(JSON.stringify(defaultMesocycle))
);
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
  [
    { specificRIR: 3, cycles: 2 },
    { specificRIR: 2, cycles: 2 },
    { specificRIR: 1, cycles: 1 },
    { specificRIR: 0, cycles: 1 }
  ]
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
export const editingMesocycleId: Writable<string | null> = persisted("editingMesocycleId", null);

export function setMesocycleStores(mesocycle: StoreMesocycleType) {
  originalMesocycle.set(mesocycle);
  mesocycleName.set(mesocycle.name);
  mesocycleCaloricState.set(mesocycle.caloricBalance);
  mesocycleDuration.set(getTotalDuration(mesocycle.RIRProgression));
  mesocycleStartRIR.set(mesocycle.RIRProgression.length - 1);
  customizeRIRProgression.set(false);
  mesocycleRIRProgression.set(mesocycle.RIRProgression);
  selectedSplitId.set(mesocycle.exerciseSplitId);
  remainingMuscleGroups.set(muscleGroups.slice());
  useSpecializations.set(mesocycle.specializations !== null ? true : false);
  primarySpecializations.set(getPrimarySpecializations(mesocycle.specializations));
  secondarySpecializations.set(getSecondarySpecializations(mesocycle.specializations));
  startMesocycleNow.set(false);
}

export function didMesocycleStoresChange() {
  const mesocycle = get(originalMesocycle);
  if (mesocycle.name !== get(mesocycleName)) return true;
  // TODO: match the rest of the props

  return false;
}

export function buildMesocycleFromStores() {
  let specializations: Mesocycle["specializations"] = null;
  if (get(useSpecializations)) {
    specializations = [];
    for (const muscleGroup of get(primarySpecializations)) {
      specializations.push({ muscleGroup, type: "primary" });
    }
    for (const muscleGroup of get(secondarySpecializations)) {
      specializations.push({ muscleGroup, type: "secondary" });
    }
  }
  const currentMesocycle: Omit<Mesocycle, "startTimestamp"> = {
    name: get(mesocycleName),
    RIRProgression: get(mesocycleRIRProgression),
    exerciseSplitId: get(selectedSplitId) as string,
    caloricBalance: get(mesocycleCaloricState),
    endTimestamp: null,
    workouts: [],
    performanceLosses: { exercises: [], muscleGroups: [], microcycle: null },
    specializations
  };
  return currentMesocycle;
}
