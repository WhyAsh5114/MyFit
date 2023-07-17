import { writable, type Writable } from 'svelte/store';

export const mesoName: Writable<string> = writable('');
export const duration = writable(6);
export const startRIR: Writable<number> = writable(3);

export const splitSchedule: Writable<[string, string, string, string, string, string, string]> = writable([
	'',
	'',
	'',
	'',
	'',
	'',
	''
]);

export const splitExercises: Writable<
	[SplitExercise[], SplitExercise[], SplitExercise[], SplitExercise[], SplitExercise[], SplitExercise[], SplitExercise[]]
> = writable([[], [], [], [], [], [], []]);
