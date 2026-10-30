import { createMutation } from '@tanstack/svelte-query';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { queryClient } from '#lib/clients/query-client.js';
import type { NewRow } from '@myfit/shared/client';
import { macroTargetsKeys } from '../keys';

export const useCreateMacroTargets = () =>
	createMutation(() => ({
		mutationFn: async (data: NewRow<'MacroTargets'>) => {
			const { orm } = await getDb();
			return await orm.macroTargets.create(data);
		},

		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: macroTargetsKeys.byUser(data.userId)
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create macro targets:', error);
		}
	}));
