import { createCaller } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = async (event) => {
	event.depends(`mesocycles:${event.params.mesocycleId}`);
	const trpc = createCaller(await createContext(event));
	const mesocycle = trpc.mesocycles.findById(event.params.mesocycleId);
	return { mesocycle };
};
