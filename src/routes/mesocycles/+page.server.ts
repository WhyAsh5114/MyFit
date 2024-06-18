import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';

export const load = async (event) => {
	event.depends('mesocycles:all');
	event.depends('mesocycles:active');
	const trpc = createCaller(await createContext(event));
	const searchString = event.url.searchParams.get('search') ?? undefined;

	return {
		mesocycles: trpc.mesocycles.load({ searchString }),
		activeMesocycle: trpc.mesocycles.findActiveMesocycle()
	};
};
