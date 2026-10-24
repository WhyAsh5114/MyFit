import { createMutation } from '@tanstack/svelte-query';
import { getDb } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/clients/query-client';
import { foodEntryKeys } from '../keys';

/** Identifies a food entry within its owner's diary. */
type MutationProps = {
	userId: string;
	id: string;
};

/** Deletes an owned entry and invalidates its diary day after the tracked write commits. */
export const useDeleteFoodEntry = () =>
	createMutation(() => ({
		mutationFn: async ({ userId, id }: MutationProps) => {
			const db = await getDb();
			// An ownership mismatch must roll back both the deletion and its outbox entry.
			return db.transaction(['foodEntry'], async (tx) => {
				const entry = await tx.foodEntry.delete(id);
				if (entry.userId !== userId) throw new Error(`Food entry ${id} not found`);
				return entry;
			});
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
