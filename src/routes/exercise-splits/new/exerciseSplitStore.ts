import { persisted } from 'svelte-persisted-store';
import type { Writable } from 'svelte/store';

export const exerciseSplit: Writable<ExerciseSplit> = persisted('exerciseSplit', {
	name: '',
	splitDays: []
});
