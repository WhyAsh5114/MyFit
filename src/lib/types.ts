import type { ExerciseSplit, ExerciseSplitDay, ExerciseTemplate } from "@prisma/client";

export type ExerciseSplitWithoutIDs = Omit<ExerciseSplit, 'id' | 'userId'>;
export type ExerciseSplitDayWithoutIDs = Omit<ExerciseSplitDay, 'id' | 'exerciseSplitId'>;
export type ExerciseTemplateWithoutIDs = Omit<ExerciseTemplate, 'id' | 'exerciseSplitDayId'>;

export type FullExerciseSplit = ExerciseSplit & {
	exerciseSplitDays: (ExerciseSplitDay & { exercises: ExerciseTemplate[] })[];
};
export type FullExerciseSplitWithoutIDs = ExerciseSplitWithoutIDs & {
	exerciseSplitDays: (ExerciseSplitDayWithoutIDs & { exercises: ExerciseTemplateWithoutIDs[] })[];
};