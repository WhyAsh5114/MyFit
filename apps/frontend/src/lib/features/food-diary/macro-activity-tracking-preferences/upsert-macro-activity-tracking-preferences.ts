import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/clients/query-client';
import type { Prisma } from '@myfit/api/prisma/client';
import { macroActivityTrackingKeys } from './macro-activity-tracking.keys';

export const useUpsertMacroActivityTrackingPreferencesMutation = () =>
	createMutation(() => ({
		mutationFn: async (data: Prisma.MacroActivityTrackingPreferencesUncheckedCreateInput) => {
			const client = getClient();
			return await client.macroActivityTrackingPreferences.upsert({
				where: { userId: data.userId },
				update: data,
				create: data
			});
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: macroActivityTrackingKeys.all
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to upsert macro activity tracking preferences:', error);
		}
	}));
