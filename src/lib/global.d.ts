// * Ensure the type matches in commonDB.ts
const commonMuscleGroups = [
	'Chest',
	'Front delts',
	'Side delts',
	'Rear delts',
	'Back',
	'Traps',
	'Triceps',
	'Biceps',
	'Forearms',
	'Quads',
	'Hamstrings',
	'Glutes',
	'Calves'
] as const;

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

type ActiveMesocycle = {
	mesoID: number;
	startDate: EpochTimeStamp;
	workouts: number[];
};

interface PerformedMesocycle extends ActiveMesocycle {
	endDate: EpochTimeStamp;
}

type Workout = {
	timestamp: EpochTimeStamp;
	dayNumber: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	mesoID: number;
	difficultyRating: 1 | 2 | 3 | 4 | 5;
	exercisesPerformed: WorkoutExercise[];
	muscleGroupWorkloads: Record<(typeof commonMuscleGroups)[number], 'low' | 'moderate' | 'high'>;
	plannedRIR: number;
};

type WorkoutExercise = {
	name: string;
	repsAndRIR: [number, number][];
	repRangeStart: number;
	repRangeEnd: number;
	muscleTarget: (typeof commonMuscleGroups)[number];
	setType: 'straight' | 'drop' | 'down' | 'top' | 'myorep' | 'myorep match' | 'giant';
	jointPainRating: 'none' | 'moderate' | 'high';
	pumpRating: 'none' | 'moderate' | 'high';
	disruptionRating: 'none' | 'moderate' | 'high';
	mindMuscleConnectionRating: 'none' | 'moderate' | 'high';
};
