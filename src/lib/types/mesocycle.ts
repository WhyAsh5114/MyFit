const CaloricStates = [
  {
    name: "Hypo-caloric",
    commonTerm: "Deficit",
    value: -1
  },
  {
    name: "Iso-caloric",
    commonTerm: "Maintenance",
    value: 0
  },
  {
    name: "Hyper-caloric",
    commonTerm: "Surplus",
    value: 1
  }
] as const;

type CaloricStateValue = (typeof CaloricStates)[number]["value"];

interface RIRProgressionData {
  specificRIR: number;
  cycles: number;
}

interface MesocycleTemplate {
  name: string;
  startRIR: number;
  RIRProgression: RIRProgressionData[];
  exerciseSplit: ({ name: string; exercises: SplitExercise[] } | null)[];
  caloricBalance: CaloricStateValue;
  specialization?: MuscleGroup[];
}

interface ActiveMesocycle {
  templateMesoId: string;
  startTimestamp: EpochTimeStamp;
  workouts: (string | null)[];
}

type Mesocycle = ActiveMesocycle & {
  endTimestamp?: EpochTimeStamp;
};

type PerformedMesocycle = ActiveMesocycle & {
  endTimestamp: EpochTimeStamp;
};

interface SplitExercise {
  name: string;
  sets: number;
  targetMuscleGroup: MuscleGroup;
  repRangeStart: number;
  repRangeEnd: number;
  weightType: ExerciseWeightType;
  note?: string;
}
