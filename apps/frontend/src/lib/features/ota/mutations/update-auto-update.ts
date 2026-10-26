import { createMutation } from '@tanstack/svelte-query';
import { getDb } from '$lib/clients/idb-client';
import { m } from '$lib/paraglide/messages';
import { toast } from 'svelte-sonner';
import { queryClient } from '$lib/clients/query-client';
import { userKeys } from '$lib/features/user/keys';

/** Updates the OTA preference and refreshes the matching account queries. */
export const useUpdateAutoUpdate = () =>
	createMutation(() => ({
		mutationFn: async ({ userId, autoUpdate }: { userId: string; autoUpdate: boolean }) => {
			const { orm } = await getDb();
			await orm.user.where({ id: userId }).update({ autoUpdate });
		},

		onSuccess: (_, { userId }) => {
			queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
			queryClient.invalidateQueries({ queryKey: userKeys.current() });
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('OTA: Failed to save autoUpdate preference:', error);
		}
	}));
