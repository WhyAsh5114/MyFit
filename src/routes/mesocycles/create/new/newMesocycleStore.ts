import { writable, type Writable } from "svelte/store";

export const customizeRIRProgression: Writable<boolean> = writable(false);

export const exerciseSplit: Writable<MesocycleTemplate["exerciseSplit"]> = writable(
	Array.from({ length: 7 }, () => ({ name: "", exercises: [] }))
);

export const mesocycleName: Writable<string> = writable("");
export const mesocycleDuration: Writable<number> = writable(6);
export const mesocycleStartRIR: Writable<number> = writable(3);
export const mesocycleRIRProgression: Writable<ProgressionData[]> = writable();
