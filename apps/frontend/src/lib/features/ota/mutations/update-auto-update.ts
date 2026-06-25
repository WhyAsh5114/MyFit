import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { m } from '$lib/paraglide/messages';
import { toast } from 'svelte-sonner';
import { queryClient } from '$lib/clients/query-client';
import { userKeys } from '$lib/features/user/keys';

export const useUpdateAutoUpdate = () =>
	createMutation(() => ({
		mutationFn: async ({ userId, autoUpdate }: { userId: string; autoUpdate: boolean }) => {
			await getClient().user.update({
				where: { id: userId },
				data: { autoUpdate }
			});
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
