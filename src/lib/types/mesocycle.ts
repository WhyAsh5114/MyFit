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

type RIRProgressionData = {
  specificRIR: number;
  cycles: number;
};

type MuscleGroupSpecialization = {
  muscleGroup: MuscleGroup;
  type: "primary" | "secondary";
};

type PerformanceLossFixDate = {
  dayNumber: number;
  cycleNumber: number;
};

type Mesocycle = {
  name: string;
  RIRProgression: RIRProgressionData[];
  exerciseSplitId: string;
  caloricBalance: CaloricStateValue;
  specialization: MuscleGroupSpecialization[] | null;
  startTimestamp: EpochTimeStamp;
  endTimestamp: EpochTimeStamp | null;
  workouts: (string | null)[];
  performanceLosses: {
    exercises: {
      name: string;
      dayName: string;
      fixDay: PerformanceLossFixDate;
      accepted: boolean;
    }[];
    muscleGroups: {
      muscleGroup: MuscleGroup;
      recoveryDay: PerformanceLossFixDate;
      slightlyLessVolumeDay: PerformanceLossFixDate;
      accepted: boolean;
    }[];
    microcycle: { cycleNumber: number; fixCycleNumber: number; accepted: boolean };
  };
};
