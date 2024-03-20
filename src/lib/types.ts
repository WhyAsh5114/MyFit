/* eslint-disable @typescript-eslint/no-unused-vars */
type WithUID<T> = T & { userId: string };

const MuscleGroups = [
	'Chest',
	'Front delts',
	'Side delts',
	'Rear delts',
	'Lats',
	'Traps',
	'Triceps',
	'Biceps',
	'Forearms',
	'Quads',
	'Hamstrings',
	'Glutes',
	'Calves',
	'Abs'
] as const;
type MuscleGroup = (typeof MuscleGroups)[number];

const SetTypes = ['straight', 'drop', 'down', 'top', 'myorep', 'myorep match', 'giant'] as const;

type ExerciseSetType = (typeof SetTypes)[number];

type ExerciseSplit = {
	name: string;
	splitDays: (ExerciseSplitDay | null)[];
};

type ExerciseSplitDay = {
	name: string;
	exerciseTemplates: ExerciseTemplate[];
};

type ExerciseTemplate = {
	name: string;
	sets: number;
	targetMuscleGroup: MuscleGroup;
	setType: ExerciseSetType;
	repRangeStart: number;
	repRangeEnd: number;
	involvesBodyweight: boolean;
	note?: string;
};
