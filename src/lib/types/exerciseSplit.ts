const SetTypes = ["straight", "drop", "down", "top", "myorep", "myorep match", "giant"] as const;

type ExerciseSetType = (typeof SetTypes)[number];

type ExerciseSplit = {
  exerciseSplitName: string;
  exerciseSplitDays: (ExerciseSplitDay | null)[];
};

type ExerciseSplitDay = {
  exerciseSplitDayName: string;
  exerciseTemplates: ExerciseTemplate[];
};

type ExerciseTemplate = {
  exerciseName: string;
  sets: number;
  targetMuscleGroup: MuscleGroup;
  setType: ExerciseSetType;
  repRangeStart: number;
  repRangeEnd: number;
  involvesBodyweight: boolean;
  note?: string;
};
