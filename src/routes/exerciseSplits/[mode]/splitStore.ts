import { persisted } from "svelte-persisted-store";
import { writable, type Writable } from "svelte/store";

export const originalExerciseSplitStore: Writable<ExerciseSplit> = persisted(
  "originalExerciseSplitStore",
  {
    name: "",
    splitDays: []
  }
);
export const exerciseSplitStore: Writable<ExerciseSplit> = persisted("exerciseSplitStore", {
  name: "",
  splitDays: []
});

export const selectedSplitDayIdx = writable(-1);
