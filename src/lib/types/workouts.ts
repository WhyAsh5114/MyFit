const WorkloadFeedback = [
  { name: "none", value: 0, bgColorChecked: "checked:!bg-warning", bgColor: "bg-warning" },
  { name: "decent", value: 1, bgColorChecked: "checked:!bg-accent", bgColor: "bg-accent" },
  {
    name: "pushed my limits",
    value: 2,
    bgColorChecked: "checked:!bg-success",
    bgColor: "bg-success"
  },
  { name: "too much work", value: 3, bgColorChecked: "checked:!bg-error", bgColor: "bg-error" }
];
type WorkloadState = (typeof WorkloadFeedback)[number]["value"];

const SorenessFeedback = [
  { name: "none", value: 0, bgColorChecked: "checked:!bg-warning", bgColor: "bg-warning" },
  { name: "little bit", value: 1, bgColorChecked: "checked:!bg-success", bgColor: "bg-success" },
  {
    name: "recovered on time",
    value: 2,
    bgColorChecked: "checked:!bg-accent",
    bgColor: "bg-accent"
  },
  {
    name: "interfered with workout",
    value: 3,
    bgColorChecked: "checked:!bg-error",
    bgColor: "bg-error"
  }
] as const;
type SorenessState = (typeof SorenessFeedback)[number]["value"];

interface Workout {
  startTimestamp: EpochTimeStamp;
  referenceWorkout: string | null;
  dayNumber: number;
  cycleNumber: number;
  difficultyRating: 1 | 2 | 3 | 4 | 5;
  exercisesPerformed: WorkoutExercise[];
  muscleGroupWorkloads: Partial<Record<MuscleGroup, WorkloadState | null>>;
  plannedRIR: number;
  muscleSorenessToNextWorkout: Partial<Record<MuscleGroup, SorenessState | null>>;
  deload: boolean;
  skipped: boolean;
}

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

interface WorkoutExerciseSet {
  reps: number;
  load: number;
  RIR: number;
}
interface WorkoutExercise {
  name: string;
  sets: WorkoutExerciseSet[];
  repRangeStart: number;
  repRangeEnd: number;
  bodyweight?: number | null;
  targetMuscleGroup: MuscleGroup;
  jointPainRating: JoinPainState | null;
  pumpRating: PumpState | null;
  note?: string;
}

type WorkoutExerciseWithoutSetNumbers = Omit<WorkoutExercise, "sets"> & {
  sets: Nullable<WorkoutExerciseSet>[];
};

interface WorkoutBeingPerformed {
  startTimestamp: EpochTimeStamp;
  referenceWorkout: string | null;
  dayNumber: number;
  cycleNumber: number;
  exercisesPerformed: WorkoutExerciseWithoutSetNumbers[];
  plannedRIR: number;
  deload: boolean;
}
