import { writable, type Writable } from 'svelte/store';
import type { SplitExercise } from '../../../../types/global';

export const mesoName: Writable<string> = writable('');
export const duration = writable(6);
export const startRIR: Writable<number> = writable();
export const isBasicsValidStore: Writable<() => boolean> = writable();

export const splitSchedule: Writable<[string, string, string, string, string, string, string]> =
	writable(['', '', '', '', '', '', '']);
export const isSplitValidStore: Writable<() => boolean> = writable();

export const splitExercises: Writable<
	[
		SplitExercise[],
		SplitExercise[],
		SplitExercise[],
		SplitExercise[],
		SplitExercise[],
		SplitExercise[],
		SplitExercise[]
	]
> = writable([[], [], [], [], [], [], []]);
export const isExercisesValidStore: Writable<() => boolean> = writable();

export const errorMsgs: Writable<string[]> = writable([]);
