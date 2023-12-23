import { getTotalDuration } from "$lib/util/MesocycleTemplate";
import { type Writable } from "svelte/store";
import { persisted } from "svelte-persisted-store";

export const customizeRIRProgression = persisted("customizeRIRProgression", false);
export const mesocycleName = persisted("mesocycleName", "");
export const mesocycleDuration = persisted("mesocycleDuration", 6);
export const mesocycleStartRIR = persisted("mesocycleStartRIR", 3);
export const mesocycleRIRProgression: Writable<RIRProgressionData[]> = persisted(
  "mesocycleRIRProgression",
  []
);
export const exerciseSplit: Writable<MesocycleTemplate["exerciseSplit"]> = persisted(
  "exerciseSplit",
  Array.from({ length: 7 }, () => ({ name: "", exercises: [] }))
);
export const mesocycleCaloricState: Writable<MesocycleTemplate["caloricBalance"]> = persisted(
  "caloricBalance",
  0
);
export const mesocycleSpecialization: Writable<boolean> = persisted(
  "mesocycleSpecialization",
  false
);
export const specializedMuscleGroups: Writable<MuscleGroup[]> = persisted(
  "specializedMuscleGroups",
  []
);
export const editingMesocycleId: Writable<string> = persisted("editingMesocycleId", '""');

export function resetStores() {
  customizeRIRProgression.set(false);
  mesocycleName.set("");
  mesocycleDuration.set(6);
  mesocycleStartRIR.set(3);
  mesocycleRIRProgression.set([]);
  exerciseSplit.set(Array.from({ length: 7 }, () => ({ name: "", exercises: [] })));
  mesocycleCaloricState.set(0);
  mesocycleSpecialization.set(false);
  specializedMuscleGroups.set([]);
  editingMesocycleId.set("");
}

export function setStores(mesocycleTemplate: WithSerializedId<MesocycleTemplate>) {
  mesocycleName.set(mesocycleTemplate.name);
  mesocycleDuration.set(getTotalDuration(mesocycleTemplate.RIRProgression));
  mesocycleStartRIR.set(mesocycleTemplate.RIRProgression[0]?.specificRIR ?? 3);
  mesocycleRIRProgression.set(mesocycleTemplate.RIRProgression);
  exerciseSplit.set(mesocycleTemplate.exerciseSplit);
  mesocycleCaloricState.set(mesocycleTemplate.caloricBalance);
  mesocycleSpecialization.set(mesocycleTemplate.specialization !== undefined);
  specializedMuscleGroups.set(mesocycleTemplate.specialization ?? []);
  editingMesocycleId.set(mesocycleTemplate._id);
}
