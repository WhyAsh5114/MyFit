import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { accountKeys } from '$lib/query-keys/account';
import { queryClient } from '$lib/query-client';
import { userKeys } from '$lib/query-keys/user';

export const useUpdateAccountNameMutation = () =>
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
				queryKey: accountKeys.detail(userId)
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
