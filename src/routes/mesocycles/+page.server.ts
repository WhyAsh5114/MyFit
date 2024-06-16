import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';

export const load = async (event) => {
	const tRPC = createCaller(await createContext(event));
	const searchString = event.url.searchParams.get('search') ?? undefined;

	return {
		mesocycles: tRPC.mesocycles.load({ searchString }),
		activeMesocycle: tRPC.mesocycles.findActiveMesocycle()
	};
};
