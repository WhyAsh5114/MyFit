const WorkloadFeedback = [
	{ name: "none", value: 0, bgColor: "checked:!bg-warning" },
	{ name: "decent", value: 1, bgColor: "checked:!bg-accent" },
	{ name: "pushed my limits", value: 2, bgColor: "checked:!bg-success" },
	{ name: "too much work", value: 3, bgColor: "checked:!bg-warning" }
];
type WorkloadState = (typeof WorkloadFeedback)[number]["value"];

const SorenessFeedback = [
	{ name: "none", value: 0, bgColor: "checked:!bg-warning" },
	{ name: "little bit", value: 1, bgColor: "checked:!bg-success" },
	{ name: "recovered on time", value: 2, bgColor: "checked:!bg-accent" },
	{ name: "interfered with workout", value: 3, bgColor: "checked:!bg-error" }
] as const;
type SorenessState = (typeof SorenessFeedback)[number]["value"];

type Workout = {
	startTimestamp: EpochTimeStamp;
	referenceWorkout: null | string;
	dayNumber: number;
	cycleNumber: number;
	difficultyRating: 1 | 2 | 3 | 4 | 5;
	exercisesPerformed: WorkoutExercise[];
	muscleGroupWorkloads: Partial<Record<MuscleGroup, null | WorkloadState>>;
	plannedRIR: number;
	muscleSorenessToNextWorkout: Partial<Record<MuscleGroup, null | SorenessState>>;
	deload: boolean;
};

const JointPainFeedback = [
	{ name: "no pain", value: 0, bgColor: "checked:!bg-success" },
	{ name: "some pain", value: 1, bgColor: "checked:!bg-warning" },
	{ name: "it hurts", value: 2, bgColor: "checked:!bg-error" }
] as const;
type JoinPainState = (typeof JointPainFeedback)[number]["value"];

const PumpFeedback = [
	{ name: "no pump", value: 0, bgColor: "checked:!bg-warning" },
	{ name: "decent pump", value: 1, bgColor: "checked:!bg-success" },
	{ name: "great pump", value: 2, bgColor: "checked:!bg-accent" }
] as const;
type PumpState = (typeof PumpFeedback)[number]["value"];

type WorkoutExercise = {
	name: string;
	sets: {
		reps: number;
		load: number;
		RIR: number;
	}[];
	repRangeStart: number;
	repRangeEnd: number;
	weightType: ExerciseWeightType;
	targetMuscleGroup: MuscleGroup;
	jointPainRating: JoinPainState | null;
	pumpRating: PumpState | null;
	note?: string;
};

type WorkoutExerciseWithoutSetNumbers = Omit<WorkoutExercise, "sets"> & {
	sets: Nullable<WorkoutExercise["sets"][number]>[];
};

type WorkoutBeingPerformed = {
	startTimestamp: EpochTimeStamp;
	referenceWorkout: null | string;
	dayNumber: number;
	cycleNumber: number;
	exercisesPerformed: WorkoutExerciseWithoutSetNumbers[];
	plannedRIR: number;
	deload: boolean;
};
