import { writable, type Writable } from 'svelte/store';

export const SplitName = writable('PPL');

// Day => Workout
export const SplitSchedule: Writable<Record<string, string>> = writable({
	Mon: 'Push',
	Tue: 'Pull',
	Wed: 'Legs',
	Thu: 'Rest',
	Fri: 'Push',
	Sat: 'Pull',
	Sun: 'Legs'
});

// UniqueWorkoutName => workout
export const SplitWorkouts: Writable<Record<string, Array<Exercise>>> = writable({});
