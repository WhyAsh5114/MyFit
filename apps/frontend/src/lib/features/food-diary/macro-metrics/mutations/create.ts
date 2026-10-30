import { createMutation } from '@tanstack/svelte-query';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { queryClient } from '#lib/clients/query-client.js';
import type { NewRow } from '@myfit/shared/client';
import { macroMetricsKeys } from '../keys';

export const useCreateMacroMetrics = () =>
	createMutation(() => ({
		mutationFn: async (data: NewRow<'MacroMetrics'>) => {
			const { orm } = await getDb();
			return await orm.macroMetrics.create(data);
		},

		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: macroMetricsKeys.byUser(data.userId)
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create metrics:', error);
		}
	}));
