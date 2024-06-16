import { createCaller } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';
import type { Prisma } from '@prisma/client';

export const load = async (event) => {
	const tRPC = createCaller(await createContext(event));
	const mesocycle = tRPC.mesocycles.findById(parseInt(event.params.mesocycleId));
	return { mesocycle };
};

export type MesocycleWithExerciseSplit = Prisma.MesocycleGetPayload<{
	include: { exerciseSplit: true };
}>;
