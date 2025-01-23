import { createCaller } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = async (event) => {
	const trpc = createCaller(await createContext(event));
	const exerciseSplit = trpc.exerciseSplits.findById(event.params.exerciseSplitId);
	return { exerciseSplit };
};
