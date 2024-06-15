import { exerciseSplits } from './routes/exerciseSplits';
import { t } from '$lib/trpc/t';

export const router = t.router({
	exerciseSplits
});

export const createCaller = t.createCallerFactory(router);
export type Router = typeof router;
