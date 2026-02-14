import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/clients/query-client';
import type { Prisma } from '@myfit/api/prisma/client';
import { macroMetricsKeys } from './macro-metrics.keys';

export const useCreateMacroMetricsMutation = () =>
	createMutation(() => ({
		mutationFn: async (data: Prisma.MacroMetricsUncheckedCreateInput) => {
			const client = getClient();
			return await client.macroMetrics.create({ data });
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: macroMetricsKeys.all
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create metrics:', error);
		}
	}));
