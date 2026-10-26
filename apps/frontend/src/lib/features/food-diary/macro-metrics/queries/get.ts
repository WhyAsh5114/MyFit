import { createQuery } from '@tanstack/svelte-query';
import { getDb } from '$lib/clients/idb-client';
import { macroMetricsKeys } from '../keys';

export const useMacroMetrics = (getUserId: () => string) =>
	createQuery(() => {
		const userId = getUserId();
		return {
			queryKey: macroMetricsKeys.byUser(userId),
			queryFn: async () => {
				const { orm } = await getDb();
				return await orm.macroMetrics.where({ userId }).orderBy({ effectiveFrom: 'desc' }).first();
			},
			enabled: !!userId
		};
	});
