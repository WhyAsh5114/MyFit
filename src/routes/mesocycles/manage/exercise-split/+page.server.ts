import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';

export const load = async (event) => {
	const tRPC = createCaller(await createContext(event));
	const exerciseSplits = tRPC.exerciseSplits.loadAllNames();
	return { exerciseSplits };
};
