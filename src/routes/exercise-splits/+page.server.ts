import { createCaller } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = async (event) => {
	const tRPC = createCaller(await createContext(event));
	const searchString = event.url.searchParams.get('search') ?? undefined;
	
	const exerciseSplits = tRPC.exerciseSplits.load({
		include: { exerciseSplitDays: true },
		searchString
	});
	return { exerciseSplits };
};
