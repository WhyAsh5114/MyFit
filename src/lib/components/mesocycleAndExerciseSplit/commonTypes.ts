import type { Prisma } from '@prisma/client';

export type NormalExerciseTemplateWithoutIds =
	Prisma.ExerciseTemplateCreateWithoutExerciseSplitDayInput;
export type MesocycleExerciseTemplateWithoutIds =
	Prisma.MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInput;

export type ExerciseTemplateWithoutIds =
	| NormalExerciseTemplateWithoutIds
	| MesocycleExerciseTemplateWithoutIds;
