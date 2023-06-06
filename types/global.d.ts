import type { commonMuscleGroups } from '$lib/commonDB';

type SplitExercise = {
	name: string | undefined;
	sets: number | undefined;
	setType: 'straight' | 'drop' | 'down' | 'top' | 'myorep' | 'myorep match' | 'giant' | undefined;
	muscleTarget: (typeof commonMuscleGroups)[number] | undefined;
	repRangeStart: number | undefined;
	repRangeEnd: number | undefined;
};
