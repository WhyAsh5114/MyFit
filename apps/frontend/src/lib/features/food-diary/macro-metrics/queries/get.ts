import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { macroMetricsKeys } from '../keys';

export const useMacroMetrics = (getUserId: () => string) =>
	createQuery(() => {
		const userId = getUserId();
		return {
			queryKey: macroMetricsKeys.byUser(userId),
			queryFn: async () => {
				return await getClient().macroMetrics.findFirst({
					where: { userId },
					orderBy: { effectiveFrom: 'desc' }
				});
			},
			enabled: !!userId
		};
	});
