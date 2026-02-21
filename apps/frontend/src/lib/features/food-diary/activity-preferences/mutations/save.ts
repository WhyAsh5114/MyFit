import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/clients/query-client';
import type { Prisma } from '@myfit/api/prisma/client';
import { activityPreferencesKeys } from '../keys';

export const useSaveActivityPreferences = () =>
	createMutation(() => ({
		mutationFn: async (data: Prisma.ActivityPreferencesUncheckedCreateInput) => {
			const client = getClient();
			return await client.activityPreferences.create({
				data
			});
		},

		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: activityPreferencesKeys.byUser(data.userId)
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to upsert activity preferences:', error);
		}
	}));
