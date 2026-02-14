import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { macroMetricsKeys } from './macro-metrics.keys';

export const useGetMacroMetricsQuery = (getUserId: () => string) =>
	createQuery(() => {
		const userId = getUserId();
		return {
			queryKey: macroMetricsKeys.all,
			queryFn: async () => {
				const client = getClient();
				try {
					return await client.macroMetrics.findFirst({
						where: { userId },
						orderBy: { createdAt: 'desc' }
					});
				} catch (error) {
					toast.error('Failed to fetch metrics');
					console.error('Error fetching metrics:', error);
				}
			},
			enabled: !!userId
		};
	});
