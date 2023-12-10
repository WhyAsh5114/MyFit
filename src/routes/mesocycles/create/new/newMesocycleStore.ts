/* eslint-disable svelte/no-ignored-unsubscribe */
import { type Writable, writable } from "svelte/store";

let ls: Storage | undefined;
if (typeof window !== "undefined") {
  ls = localStorage;
}

export const customizeRIRProgression: Writable<boolean> = writable(
  JSON.parse(ls?.getItem("customizeRIRProgression") || "false")
);

export const mesocycleName: Writable<string> = writable(
  JSON.parse(ls?.getItem("mesocycleName") || '""')
);
export const mesocycleDuration: Writable<number> = writable(
  JSON.parse(ls?.getItem("mesocycleDuration") || "6")
);
export const mesocycleStartRIR: Writable<number> = writable(
  JSON.parse(ls?.getItem("mesocycleStartRIR") || "3")
);
export const mesocycleRIRProgression: Writable<RIRProgressionData[]> = writable(
  JSON.parse(ls?.getItem("RIRProgressionData") || "[]")
);

export const exerciseSplit: Writable<MesocycleTemplate["exerciseSplit"]> = writable(
  JSON.parse(
    ls?.getItem("exerciseSplit") ||
      JSON.stringify(Array.from({ length: 7 }, () => ({ name: "", exercises: [] })))
  )
);

export const mesocycleCaloricState: Writable<MesocycleTemplate["caloricBalance"]> = writable(
  JSON.parse(ls?.getItem("caloricBalance") || "0")
);
export const mesocycleSpecialization: Writable<boolean> = writable(
  JSON.parse(ls?.getItem("mesocycleSpecialization") || "false")
);
export const specializedMuscleGroups: Writable<MuscleGroup[]> = writable(
  JSON.parse(ls?.getItem("specializedMuscleGroups") || "[]")
);

customizeRIRProgression.subscribe(
  (val) => ls?.setItem("customizeRIRProgression", JSON.stringify(val))
);
mesocycleName.subscribe((val) => ls?.setItem("mesocycleName", JSON.stringify(val)));
mesocycleDuration.subscribe((val) => ls?.setItem("mesocycleDuration", JSON.stringify(val)));
mesocycleStartRIR.subscribe((val) => ls?.setItem("mesocycleStartRIR", JSON.stringify(val)));
mesocycleRIRProgression.subscribe(
  (val) => ls?.setItem("mesocycleRIRProgression", JSON.stringify(val))
);
exerciseSplit.subscribe((val) => {
  console.log(val);
  ls?.setItem("exerciseSplit", JSON.stringify(val));
});
mesocycleCaloricState.subscribe((val) => ls?.setItem("mesocycleCaloricState", JSON.stringify(val)));
mesocycleSpecialization.subscribe(
  (val) => ls?.setItem("mesocycleSpecialization", JSON.stringify(val))
);
specializedMuscleGroups.subscribe(
  (val) => ls?.setItem("specializedMuscleGroups", JSON.stringify(val))
);
