import { persisted } from "svelte-persisted-store";
import type { Writable } from "svelte/store";

export const mesocycleName = persisted("mesocycleName", "");
export const mesocycleCaloricState: Writable<CaloricStateValue> = persisted(
  "mesocycleCaloricState",
  0
);
export const mesocycleDuration = persisted("mesocycleDuration", 6);
export const mesocycleStartRIR = persisted("mesocycleStartRIR", 3);
export const customizeRIRProgression = persisted("customizeRIRProgression", false);
export const selectedSplitId: Writable<null | string> = persisted("selectedSplitId", null);
