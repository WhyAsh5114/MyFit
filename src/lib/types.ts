/* eslint-disable @typescript-eslint/no-unused-vars */
type WithSID<T> = T & { _id: string };
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

const SetTypes = ['Straight', 'Drop', 'Down', 'Top', 'Myorep', 'Myorep match', 'Giant'] as const;
type SetType = (typeof SetTypes)[number];

type ExerciseSetType =
	| StraightSet
	| DownSet
	| DropSet
	| MyorepMatchSet
	| MyorepSet
	| GiantSet
	| TopSet;

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
	involvesBodyweight: boolean;
	note?: string;
};

type GenericExerciseSetType<Type extends string> = {
	type: Type;
	repRangeStart: number;
	repRangeEnd: number;
};

type ChangingSetProperties = {
	changeType: 'Percentage' | 'Absolute load';
	changeAmount: number;
};

type StraightSet = GenericExerciseSetType<'Straight'>;
type MyorepMatchSet = GenericExerciseSetType<'Myorep match'>;
type MyorepSet = GenericExerciseSetType<'Myorep'>;
type GiantSet = GenericExerciseSetType<'Giant'>;

type DownSet = GenericExerciseSetType<'Down'> & ChangingSetProperties;
type DropSet = GenericExerciseSetType<'Drop'> & ChangingSetProperties;
type TopSet = GenericExerciseSetType<'Top'> & ChangingSetProperties;
