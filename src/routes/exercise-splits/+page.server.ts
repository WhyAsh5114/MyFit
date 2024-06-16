import { createCaller } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = async (event) => {
	const tRPC = createCaller(await createContext(event));
	return tRPC.exerciseSplits.load();
};
