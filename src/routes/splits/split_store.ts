import { writable, type Writable } from 'svelte/store';

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

});
