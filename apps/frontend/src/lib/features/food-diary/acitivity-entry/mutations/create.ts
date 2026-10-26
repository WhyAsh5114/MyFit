import { createMutation } from '@tanstack/svelte-query';
import { getDb } from '$lib/clients/idb-client';
import type { NewRow } from '@myfit/shared/client';
import { activityEntryKeys } from '../keys';
import { queryClient } from '$lib/clients/query-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';

export const useCreateActivityEntry = () =>
	createMutation(() => ({
		mutationFn: async (data: NewRow<'ActivityEntry'>) => {
			const { orm } = await getDb();
			return await orm.activityEntry.create(data);
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
