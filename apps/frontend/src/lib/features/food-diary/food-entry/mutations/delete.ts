import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/clients/query-client';
import { foodEntryKeys } from '../keys';

type MutationProps = {
	userId: string;
	id: string;
};

export const useDeleteFoodEntry = () =>
	createMutation(() => ({
		mutationFn: async ({ userId, id }: MutationProps) => {
			const client = getClient();
			return await client.foodEntry.delete({ where: { id, userId } });
		},

		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: foodEntryKeys.byDate(data.userId, data.eatenAt.toISOString().split('T')[0])
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to delete food entry:', error);
		}
	}));
