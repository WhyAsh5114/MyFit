import { createMutation } from '@tanstack/svelte-query';
import { getDb } from '$lib/clients/idb-client';
import type { NewRow } from '@myfit/shared/client';
import { activityEntryKeys } from '../keys';
import { queryClient } from '$lib/clients/query-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';

export const useUpsertDynamicActivityData = () =>
	createMutation(() => ({
		mutationFn: async ({ id, ...data }: NewRow<'ActivityEntry'> & { id?: string }) => {
			const { orm } = await getDb();
			const entryId = id ?? crypto.randomUUID();
			return await orm.activityEntry.upsert({
				where: { id: entryId },
				update: data,
				create: { ...data, id: entryId }
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
