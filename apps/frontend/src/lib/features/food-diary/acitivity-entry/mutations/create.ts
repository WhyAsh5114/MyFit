import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import type { Prisma } from '@myfit/api/prisma/client';
import { activityEntryKeys } from '../keys';
import { queryClient } from '$lib/clients/query-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';

export const useCreateActivityEntry = () =>
	createMutation(() => ({
		mutationFn: async (data: Prisma.ActivityEntryUncheckedCreateInput) => {
			return await getClient().activityEntry.create({
				data
			});
		},

		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: activityEntryKeys.byUser(data.userId)
			});
		},

		onError: (error) => {
      toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create activity entry:', error);
		}
	}));
