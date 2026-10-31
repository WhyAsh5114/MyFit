import { useMutation } from '#lib/features/data/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { invalidateKeys } from '#lib/features/data/dependencies.js';
import type { NewRow } from '@myfit/shared/client';
import { macroMetricsKeys } from '../keys';

export const useCreateMacroMetrics = () =>
	useMutation({
		mutationFn: async (data: NewRow<'MacroMetrics'>) => {
			const { orm } = await getDb();
			return await orm.macroMetrics.create(data);
		},

		onSuccess: (data) => invalidateKeys(macroMetricsKeys.byUser(data.userId)),

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create metrics:', error);
		}
	});
