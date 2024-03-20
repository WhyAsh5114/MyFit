import { persisted } from 'svelte-persisted-store';
import type { Writable } from 'svelte/store';

export const exerciseSplitStore: Writable<ExerciseSplit> = persisted('exerciseSplitStore', {
	name: '',
	splitDays: Array.from({ length: 7 }).map(() => {
		return { name: '', exerciseTemplates: [] };
	})
});
