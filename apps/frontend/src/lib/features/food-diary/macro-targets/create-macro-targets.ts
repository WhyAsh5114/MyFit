import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/clients/query-client';
import type { Prisma } from '@myfit/api/prisma/client';
import { macroTargetsKeys } from './macro-targets.keys';

export const useCreateMacroTargetsMutation = () =>
	createMutation(() => ({
		mutationFn: async (data: Prisma.MacroTargetsUncheckedCreateInput) => {
			const client = getClient();
			return await client.macroTargets.create({ data });
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: macroTargetsKeys.all
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create macro targets:', error);
		}
	}));
