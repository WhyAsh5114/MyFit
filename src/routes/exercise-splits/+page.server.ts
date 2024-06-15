import type { ExerciseSplitDayWithoutIDs, ExerciseTemplateWithoutIDs } from '$lib/types';
import { createCaller } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export type ExerciseSplitRuneDataType = {
	splitName: string;
	splitDays: ExerciseSplitDayWithoutIDs[];
	splitExercises: ExerciseTemplateWithoutIDs[][];
};

export const load = async (event) => {
	const tRPC = createCaller(await createContext(event));
	return tRPC.exerciseSplits.load();
};
