import { initTRPC } from '@trpc/server';
import type { Context } from './context';
import { exerciseSplits } from './routes/exerciseSplits';

export const t = initTRPC.context<Context>().create();

export const router = t.router({
	exerciseSplits
});

export type Router = typeof router;
