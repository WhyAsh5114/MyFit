const CaloricStates = {
	"Hypo-caloric": -1,
	"Iso-caloric": 0,
	"Hyper-caloric": 1
} as const;

type CaloricState = (typeof CaloricStates)[keyof typeof CaloricStates];

type RIRProgressionData = { specificRIR: number; cycles: number };

type MesocycleTemplate = {
	name: string;
	startRIR: number;
	RIRProgression: RIRProgressionData[];
	exerciseSplit: (null | { name: string; exercises: SplitExercise[] })[];
	caloricBalance: CaloricState;
	specialization?: MuscleGroup[];
};

type ActiveMesocycle = {
	templateMesoID: number;
	startDate: EpochTimeStamp;
	workouts: number[];
};

type PerformedMesocycle = ActiveMesocycle & {
	endDate: EpochTimeStamp;
};

type SplitExercise = {
	name: string;
	sets: number;
	targetMuscleGroup: MuscleGroup;
	repRangeStart: number;
	repRangeEnd: number;
	weightType: ExerciseWeightType;
	note: string;
};
