import { type Writable, writable } from 'svelte/store';

export const CurrentSplit: Writable<Split> = writable();
export const SplitName: Writable<string> = writable('');
export const SplitSchedule: Writable<Record<string, string>> = writable({
    Mon: '',
    Tue: '',
    Wed: '',
    Thu: '',
    Fri: '',
    Sat: '',
    Sun: ''
});
export const SplitWorkouts: Writable<Record<string, Exercise[]>> = writable({});
export const CurrentSplitActive: Writable<boolean> = writable();
