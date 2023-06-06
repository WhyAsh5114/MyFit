import { writable, type Writable } from 'svelte/store';

export const mesoName: Writable<string> = writable('');
export const duration = writable(6);
export const startRIR: Writable<number> = writable();
export const isValid: Writable<() => boolean> = writable();

export const splitSchedule: Writable<string[]> = writable(['', '', '', '', '', '', '']);

export const splitExercises: Writable<SplitExercise[][]> = writable([[], [], [], [], [], [], []])

export const errorMsgs: Writable<string[]> = writable([]);
