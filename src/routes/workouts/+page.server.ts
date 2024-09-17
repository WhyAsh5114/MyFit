import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';

export const load = async (event) => {
	event.depends('workouts:all');
	const trpc = createCaller(await createContext(event));

	const filterData = trpc.workouts.getFilterData();
	return { filterData };
};
