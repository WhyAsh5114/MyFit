import { createContext } from '$lib/trpc/context.js';
import { createCaller } from '$lib/trpc/router.js';

export const load = async (event) => {
	const trpc = createCaller(await createContext(event));
	const activeMesocycle = await trpc.mesocycles.findActiveMesocycle();
	return { activeMesocycle };
};
