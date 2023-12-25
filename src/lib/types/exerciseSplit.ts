type ExerciseSplit = (ExerciseSplitDay | null)[];

type ExerciseSplitDay = {
  name: string;
  exerciseTemplates: ExerciseTemplate[];
};

type ExerciseTemplate = {
  name: string;
  sets: number;
  targetMuscleGroup: MuscleGroup;
  repRangeStart: number;
  repRangeEnd: number;
  involvesBodyweight: boolean;
  note: string;
};
