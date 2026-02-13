import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/clients/query-client';
import { userKeys } from '$lib/features/user/user.keys';

export const useUpdateUserNameMutation = () =>
	createMutation(() => ({
		mutationFn: async ({ userId, name }: { userId: string; name: string }) => {
			const client = getClient();

			await client.user.update({
				where: { id: userId },
				data: { name: name.trim() }
			});
		},

		onSuccess: (_, { userId }) => {
			queryClient.invalidateQueries({
				queryKey: userKeys.detail(userId)
			});
			queryClient.invalidateQueries({
				queryKey: userKeys.current()
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to update account name:', error);
		}
	}));
