import type { Prisma } from '@prisma/client';

export type SplitExerciseTemplateWithoutIdsOrIndex = Omit<
	Prisma.ExerciseTemplateCreateWithoutExerciseSplitDayInput,
	'exerciseIndex'
>;
export type MesocycleExerciseTemplateWithoutIdsOrIndex = Omit<
	Prisma.MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInput,
	'exerciseIndex'
>;

export type ExerciseTemplateWithoutIdsOrIndex =
	| SplitExerciseTemplateWithoutIdsOrIndex
	| MesocycleExerciseTemplateWithoutIdsOrIndex;
