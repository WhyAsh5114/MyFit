type ExerciseSplit = {
  name: string;
  exerciseTemplates: ExerciseTemplate[];
} | null;

type ExerciseTemplate = {
  name: string;
  sets: number;
  targetMuscleGroup: MuscleGroup;
  repRangeStart: number;
  repRangeEnd: number;
  bodyweight: boolean;
  note: string;
};
