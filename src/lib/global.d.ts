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
	startTimestamp: EpochTimeStamp;
	endTimestamp: EpochTimeStamp;
	referenceWorkout: null | number;
	dayNumber: number;
	mesoID: number;
	difficultyRating: 1 | 2 | 3 | 4 | 5;
	exercisesPerformed: WorkoutExercise[];
	muscleGroupWorkloads: Record<
		(typeof commonMuscleGroups)[number],
		undefined | 'low' | 'moderate' | 'high'
	>;
	plannedRIR: number;
	muscleSorenessToNextWorkout: Record<
		(typeof commonMuscleGroups)[number],
		undefined | 'none' | 'recovered on time' | 'interfered with workout'
	>;
	weekNumber: number;
	deload?: boolean;
};

type WorkoutExercise = {
	name: string;
	repsLoadRIR: [number | undefined, number | undefined, number][];
	repRangeStart: number;
	repRangeEnd: number;
	muscleTarget: (typeof commonMuscleGroups)[number];
	setType: 'straight' | 'drop' | 'down' | 'top' | 'myorep' | 'myorep match' | 'giant';
	jointPainRating: 'none' | 'moderate' | 'high' | undefined;
	pumpRating: 'none' | 'moderate' | 'high' | undefined;
	disruptionRating: 'none' | 'moderate' | 'high' | undefined;
	mindMuscleConnectionRating: 'none' | 'moderate' | 'high' | undefined;
};

interface MuscleSorenessData extends MuscleToLastWorkout {
	sorenessRating: Workout['muscleSorenessToNextWorkout'][(typeof commonMuscleGroups)[number]];
}
