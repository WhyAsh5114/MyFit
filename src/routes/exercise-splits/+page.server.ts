import { createCaller } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = async (event) => {
	event.depends("exerciseSplits:all")
	const trpc = createCaller(await createContext(event));
	const searchString = event.url.searchParams.get('search') ?? undefined;
	
	const exerciseSplits = trpc.exerciseSplits.load({
		include: { exerciseSplitDays: true },
		searchString
	});
	return { exerciseSplits };
};
