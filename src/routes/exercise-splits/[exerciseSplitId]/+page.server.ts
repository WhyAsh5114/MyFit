import { createCaller } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = async (event) => {
	const tRPC = createCaller(await createContext(event));
	const exerciseSplit = tRPC.exerciseSplits.findById(parseInt(event.params.exerciseSplitId));
	return { exerciseSplit };
};
