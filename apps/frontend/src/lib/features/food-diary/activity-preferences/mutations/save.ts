import { useMutation } from '#lib/data/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { invalidateKeys } from '#lib/data/dependencies.js';
import type { NewRow } from '@myfit/shared/client';
import { activityPreferencesKeys } from '../keys';

export const useSaveActivityPreferences = () =>
	useMutation({
		mutationFn: async (data: NewRow<'ActivityPreferences'>) => {
			const { orm } = await getDb();
			return await orm.activityPreferences.create(data);
		},

		onSuccess: (data) => invalidateKeys(activityPreferencesKeys.byUser(data.userId)),

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to upsert activity preferences:', error);
		}
	});
