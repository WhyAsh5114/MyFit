import { createMutation } from '@tanstack/svelte-query';
import { getDb } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/clients/query-client';
import { userKeys } from '../keys';

/** Updates the profile name and refreshes the matching account queries. */
export const useUpdateUserName = () =>
	createMutation(() => ({
		mutationFn: async ({ userId, name }: { userId: string; name: string }) => {
			const { orm } = await getDb();
			await orm.user.where({ id: userId }).update({ name: name.trim() });
		},

		onSuccess: (_, { userId }) => {
			queryClient.invalidateQueries({
				queryKey: userKeys.detail(userId)
			});
			queryClient.invalidateQueries({
				queryKey: userKeys.current(userId)
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to update account name:', error);
		}
	}));
