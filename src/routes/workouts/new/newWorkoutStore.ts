import { writable, type Writable } from 'svelte/store';

let ls: Storage | undefined = undefined;
if (typeof window !== 'undefined') {
  ls = localStorage;
}

export const startTimestamp: Writable<EpochTimeStamp> = writable(parseInt(ls?.getItem('startTimestamp') || ''));
export const workoutDay: Writable<number> = writable(parseInt(ls?.getItem('workoutDay') || ''));
export const plannedRIR: Writable<number> = writable(parseInt(ls?.getItem('plannedRIR') || ''));
export const muscleTargetsAndSets: Writable<Record<string, number>> = writable(
	JSON.parse(ls?.getItem('muscleTargetsAndSets') || '{}')
);
export const weekNumber: Writable<number> = writable(parseInt(ls?.getItem('weekNumber') || ''));
export const referenceWorkout: Writable<null | number> = writable(JSON.parse(ls?.getItem('referenceWorkout') || 'null'));
export const workoutExercises: Writable<WorkoutExercise[]> = writable(JSON.parse(ls?.getItem('workoutExercises') || '[]'));
export const muscleWorkloads: Writable<Workout['muscleGroupWorkloads']> = writable(JSON.parse(ls?.getItem('muscleWorkloads') || '[]'));
export const musclesTargetedPreviously: Writable<MuscleSorenessData[]> = writable(JSON.parse(ls?.getItem('musclesTargetedPreviously') || '[]'));

export const setsPerformedPerExercise: Writable<boolean[][]> = writable(JSON.parse(ls?.getItem('setsPerformedPerExercise') || '[]'));

startTimestamp.subscribe(val => ls?.setItem("startTimestamp", JSON.stringify(val)));
workoutDay.subscribe(val => ls?.setItem("workoutDay", JSON.stringify(val)));
plannedRIR.subscribe(val => ls?.setItem("plannedRIR", JSON.stringify(val)));
muscleTargetsAndSets.subscribe(val => ls?.setItem("muscleTargetsAndSets", JSON.stringify(val)));
weekNumber.subscribe(val => ls?.setItem("weekNumber", JSON.stringify(val)));
referenceWorkout.subscribe(val => ls?.setItem("referenceWorkout", JSON.stringify(val)));
workoutExercises.subscribe(val => ls?.setItem("workoutExercises", JSON.stringify(val)));
muscleWorkloads.subscribe(val => ls?.setItem("muscleWorkloads", JSON.stringify(val)));
musclesTargetedPreviously.subscribe(val => ls?.setItem("musclesTargetedPreviously", JSON.stringify(val)));
setsPerformedPerExercise.subscribe(val => ls?.setItem("setsPerformedPerExercise", JSON.stringify(val)));