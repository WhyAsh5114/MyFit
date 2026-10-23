import { createMutation } from '@tanstack/svelte-query';
import { getDb } from '$lib/clients/idb-client';
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
			const { orm } = await getDb();
			// delete() resolves to void, but onSuccess needs the row to invalidate the right day.
			const entry = await orm.foodEntry.where({ id, userId }).first();
			if (!entry) throw new Error(`Food entry ${id} not found`);
			await orm.foodEntry.delete(id);
			return entry;
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
