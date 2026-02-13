import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/idb-client';
import { toast } from 'svelte-sonner';
import { metricsKeys } from '$lib/query-keys/food-diary';

export const useGetMetricsQuery = (getUserId: () => string) =>
	createQuery(() => {
		const userId = getUserId();
		return {
			queryKey: metricsKeys.all,
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
