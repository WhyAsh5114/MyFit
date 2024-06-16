import { t } from '$lib/trpc/t';
import { exerciseSplits } from './routes/exerciseSplits';
import { mesocycles } from './routes/mesocycles';

export const router = t.router({
	exerciseSplits,
	mesocycles
});

export const createCaller = t.createCallerFactory(router);
export type Router = typeof router;
