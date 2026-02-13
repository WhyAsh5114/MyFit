import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/query-client';
import { metricsKeys } from '$lib/query-keys/food-diary';
import type { MacroMetricsCreateInput } from '@myfit/api/prisma/models';

export const useCreateMetricsMutation = () =>
	createMutation(() => ({
		mutationFn: async (data: MacroMetricsCreateInput) => {
			const client = getClient();
			return await client.macroMetrics.create({ data });
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: metricsKeys.all
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create metrics:', error);
		}
	}));
