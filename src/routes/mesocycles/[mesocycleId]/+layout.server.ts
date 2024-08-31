import { createCaller } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';
import { Prisma } from '@prisma/client';

export const load = async (event) => {
	event.depends(`mesocycles:${event.params.mesocycleId}`);
	const trpc = createCaller(await createContext(event));
	const mesocycle = trpc.mesocycles.findById(event.params.mesocycleId);
	return { mesocycle };
};

export type FullMesocycle = Prisma.MesocycleGetPayload<{
	include: {
		exerciseSplit: true;
		mesocycleExerciseSplitDays: { include: { mesocycleSplitDayExercises: true } };
		mesocycleCyclicSetChanges: true;
		workoutsOfMesocycle: true
	};
}>;
