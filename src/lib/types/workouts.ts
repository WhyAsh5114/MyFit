enum WorkloadFeedback {
	"low",
	"moderate",
	"high"
}
enum SorenessFeedback {
	"none",
	"little bit",
	"recovered on time",
	"interfered with workout"
}
type Workout = {
	startTimestamp: EpochTimeStamp;
	referenceWorkout: null | string;
	dayNumber: number;
	cycleNumber: number;
	templateMesoId: string;
	difficultyRating: 1 | 2 | 3 | 4 | 5;
	exercisesPerformed: WorkoutExercise[];
	muscleGroupWorkloads: Record<MuscleGroup, null | WorkloadFeedback>;
	plannedRIR: number;
	muscleSorenessToNextWorkout: Record<MuscleGroup, null | SorenessFeedback>;
	deload: boolean;
};

enum JointPainFeedback {
	"no pain",
	"some pain",
	"it hurts"
}
enum PumpFeedback {
	"no pump",
	"decent pump",
	"great pump"
}
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
	jointPainRating: JointPainFeedback | null;
	pumpRating: PumpFeedback | null;
	note: string;
};

type WorkoutExerciseWithoutSetNumbers = Omit<WorkoutExercise, "sets"> & {
	sets: Nullable<WorkoutExercise["sets"][number]>[]
}

type WorkoutBeingPerformed = {
	startTimestamp: EpochTimeStamp;
	referenceWorkout: null | string;
	dayNumber: number;
	cycleNumber: number;
	templateMesoId: string;
	exercisesPerformed: WorkoutExerciseWithoutSetNumbers[];
	plannedRIR: number;
	deload: boolean;
};
