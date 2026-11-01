import { useMutation } from '#lib/data/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import type { NewRow } from '@myfit/shared/client';
import { activityEntryKeys } from '../keys';
import { invalidateKeys } from '#lib/data/dependencies.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';

export const useCreateActivityEntry = () =>
	useMutation({
		mutationFn: async (data: NewRow<'ActivityEntry'>) => {
			const { orm } = await getDb();
			return await orm.activityEntry.create(data);
		},

		onSuccess: (data) => invalidateKeys(activityEntryKeys.byUser(data.userId)),

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create activity entry:', error);
		}
	});
