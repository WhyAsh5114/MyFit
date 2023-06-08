import type { commonMuscleGroups } from './commonDB';

type SplitExercise = {
	name: string | undefined;
	sets: number | undefined;
	setType: 'straight' | 'drop' | 'down' | 'top' | 'myorep' | 'myorep match' | 'giant' | '';
	muscleTarget: (typeof commonMuscleGroups)[number] | '';
	repRangeStart: number | undefined;
	repRangeEnd: number | undefined;
};

type Mesocycle = {
	name: string;
	duration: number;
	startRIR: number;
	splitSchedule: [string, string, string, string, string, string, string];
	splitExercises: [
		SplitExercise[],
		SplitExercise[],
		SplitExercise[],
		SplitExercise[],
		SplitExercise[],
		SplitExercise[],
		SplitExercise[]
	];
};
