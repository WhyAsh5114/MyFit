import { createContext } from '$lib/trpc/context';
import { createCaller } from '$lib/trpc/router';

export const load = async (event) => {
	const trpc = createCaller(await createContext(event));
	return { V2Counts: trpc.users.checkV2MigrationAvailability() };
};
