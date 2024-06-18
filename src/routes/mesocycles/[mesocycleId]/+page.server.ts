import { createCaller } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';
import { Prisma } from '@prisma/client';

const mesocycleIncludeClause = Prisma.validator<Prisma.MesocycleInclude>()({
	exerciseSplit: true,
	mesocycleExerciseSplitDays: { include: { mesocycleSplitDayExercises: true } },
	mesocycleCyclicSetChanges: true
});

export const load = async (event) => {
	const trpc = createCaller(await createContext(event));
	const mesocycle = trpc.mesocycles.findById(event.params.mesocycleId);
	return { mesocycle };
};

export type FullMesocycle = Prisma.MesocycleGetPayload<{ include: typeof mesocycleIncludeClause }>;
