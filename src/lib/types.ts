import type {
	ExerciseSplit as ExerciseSplitModel,
	ExerciseSplitDay as ExerciseSplitDayModel,
	ExerciseTemplate as ExerciseTemplateModel
} from '@prisma/client';

export type ExerciseSplit = Omit<ExerciseSplitModel, 'id' | 'userId'>;
export type ExerciseSplitDay = Omit<ExerciseSplitDayModel, 'id' | 'exerciseSplitId'>;
export type ExerciseTemplate = Omit<ExerciseTemplateModel, 'id' | 'exerciseSplitDayId'>;
export { MuscleGroup, SetType } from '@prisma/client';
