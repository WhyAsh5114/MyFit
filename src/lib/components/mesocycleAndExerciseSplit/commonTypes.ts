import type { Prisma } from '@prisma/client';

export type NormalExerciseTemplateWithoutIds =
	Omit<Prisma.ExerciseTemplateCreateWithoutExerciseSplitDayInput, 'exerciseIndex'>;
export type MesocycleExerciseTemplateWithoutIds =
	Omit<Prisma.MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInput, 'exerciseIndex'>;

export type ExerciseTemplateWithoutIds =
	| NormalExerciseTemplateWithoutIds
	| MesocycleExerciseTemplateWithoutIds;
