import { writable, type Writable } from 'svelte/store';

/*
export const SplitName = writable('PPL');

// Day => Workout
export const SplitSchedule: Writable<Record<string, string>> = writable({
	Mon: 'Push',
	Tue: 'Pull',
	Wed: 'Legs',
	Thu: 'Push',
	Fri: 'Pull',
	Sat: 'Legs',
	Sun: 'Rest'
});

// UniqueWorkoutName => workout
export const SplitWorkouts: Writable<Record<string, Array<Exercise>>> = writable({
	Push: new Array<Exercise>,
	Pull: new Array<Exercise>,
	Legs: new Array<Exercise>
});
*/

export const SplitName = writable('');

// Day => Workout
export const SplitSchedule: Writable<Record<string, string>> = writable({
	Mon: '',
	Tue: '',
	Wed: '',
	Thu: '',
	Fri: '',
	Sat: '',
	Sun: ''
});

// UniqueWorkoutName => workout
export const SplitWorkouts: Writable<Record<string, Array<Exercise>>> = writable({
	Push: new Array<Exercise>(),
	Pull: new Array<Exercise>(),
	Legs: new Array<Exercise>()
});
