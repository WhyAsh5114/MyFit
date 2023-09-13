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

type Mesocycle = {
	name: string;
	duration: number;
	startRIR: number;
	splitSchedule: {
		mon: SplitDay | null;
		tue: SplitDay | null;
		wed: SplitDay | null;
		thu: SplitDay | null;
		fri: SplitDay | null;
		sat: SplitDay | null;
		sun: SplitDay | null;
	};
};

type SplitDay = {
	name: string;
	exercises: SplitExercise[];
};

type SplitExercise = {
	name: string;
	sets: number;
	setType: 'straight' | 'drop' | 'down' | 'top' | 'myorep' | 'myorep match' | 'giant';
	muscleTarget: (typeof commonMuscleGroups)[number] | '';
	repRangeStart: number;
	repRangeEnd: number;
	note: string;
};

type ActiveMesocycle = {
	mesoID: number;
	startDate: EpochTimeStamp;
	workouts: number[];
};

interface PerformedMesocycle extends ActiveMesocycle {
	endDate: EpochTimeStamp;
}

type WorkoutExercise = {
	name: string;
	repsLoadRIR: [number, number, number][];
	repRangeStart: number;
	repRangeEnd: number;
	muscleTarget: (typeof commonMuscleGroups)[number];
	setType: 'straight' | 'drop' | 'down' | 'top' | 'myorep' | 'myorep match' | 'giant';
	jointPainRating: 'none' | 'moderate' | 'high' | null;
	pumpRating: 'none' | 'moderate' | 'high' | null;
	note: string;
};

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
		null | 'too easy' | 'felt fine' | 'pushed my limits' | 'too much'
	>;
	plannedRIR: number;
	muscleSorenessToNextWorkout: Record<
		(typeof commonMuscleGroups)[number],
		| null
		| 'none'
		| 'recovered well before time'
		| 'barely recovered on time'
		| 'interfered with workout'
	>;
	weekNumber: number;
	deload: boolean;
};
