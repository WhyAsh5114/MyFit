import { writable, type Writable } from "svelte/store";

export const customizeRIRProgression: Writable<boolean> = writable(false);

export const mesocycleName: Writable<string> = writable("");
export const mesocycleDuration: Writable<number> = writable(6);
export const mesocycleStartRIR: Writable<number> = writable(3);
export const mesocycleRIRProgression: Writable<RIRProgressionData[]> = writable();

export const exerciseSplit: Writable<MesocycleTemplate["exerciseSplit"]> = writable(
	Array.from({ length: 7 }, () => ({ name: "", exercises: [] }))
);

export const mesocycleCaloricState: Writable<MesocycleTemplate["caloricBalance"]> = writable(0);
export const mesocycleSpecialization: Writable<boolean> = writable(false);
export const specializedMuscleGroups: Writable<MuscleGroup[]> = writable([]);
