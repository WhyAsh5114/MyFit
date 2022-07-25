import { writable, type Writable } from 'svelte/store';

export const SplitName = writable('PPL');
export const SplitSchedule: Writable<Record<string, string>> = writable({
	Mon: 'Push',
	Tue: 'Pull',
	Wed: 'Legs',
	Thu: 'Rest',
	Fri: 'Push',
	Sat: 'Pull',
	Sun: 'Legs'
});
