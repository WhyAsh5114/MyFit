import type { Context } from '$lib/trpc/context';
import { initTRPC, lazy } from '@trpc/server';

export const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
	food: lazy(() => import('./routes/food'))
});

export const createCaller = t.createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
