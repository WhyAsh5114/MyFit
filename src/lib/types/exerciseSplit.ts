const SetTypes = ["straight", "drop", "down", "top", "myorep", "myorep match", "giant"] as const;

type ExerciseSetType = (typeof SetTypes)[number];

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
  repRangeStart: number;
  repRangeEnd: number;
  involvesBodyweight: boolean;
  note?: string;
};
